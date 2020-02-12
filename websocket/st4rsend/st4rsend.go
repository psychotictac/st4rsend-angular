package st4rsend

import (
	// io needed for EOF error generation
	//"io"
	"log"
	"time"
	"net/http"
	//"crypto/tls"
	"database/sql"
	"github.com/go-sql-driver/mysql"
	"github.com/gorilla/websocket"
	"strconv"
	"strings"
)

// st4rsend reserved variables:
// Initial Error Level, the higher the more verbose (syslog based ; 0 -> silent ; 7 -> debug)
var ErrorLevel int = 6
// Global error management
// Purpose is defining global error verbosity for non managed errors
// Hence standard error handling to be performed before call to CheckErr
func CheckErr(err error) (ret error){
	if err != nil {
		if err.Error() == "EOF" {
			return err
		}
		if driverErr, ok := err.(*mysql.MySQLError); ok {
			// Table does not exist
			if driverErr.Number == 1146 {
				return err
			}
			// Column does not exist
			if driverErr.Number == 1054 {
				return err
			}
		}
		if ErrorLevel > 5  {
			panic(err)
		}
		if ErrorLevel > 3 {
			log.Fatal(err)
		}
	}
	return err
}

// Date & Time standard NUX time.h like
// To Golang time: 
//	 timeVar = time.Unix(WsMessage.Time.SecSinceEpoch, WsMessage.Time.NanoSec)
// From Golang time: 
//	TimeStamp{
//		SecSinceEpoch: time.Unix(),
//		NanoSec: int64(time.Nanosecond())
//	}
type TimeStamp struct {
	SecSinceEpoch int64 `json:"secsinceepoch, string, omitempty"`
	NanoSec int64 `json:"nanosec, string, omitempty"`
}

// Websocket main 
type WsMessage struct {
	Sequence int64 `json:"sequence, string, omitempty"`
	Time TimeStamp
	Payload ComEncap `json:"payload, omitempty"`
}

// Comm encap
type ComEncap struct {
	ChannelID int64 `json:"channelid, string, omitempty"`
	Domain string `json:"domain, string, omitempty"`
	Command	string `json:"command, string, omitempty"`
	Data []string `json:"data, string, omitempty"`
}

// ComEncap return status structure 
type WsStatus struct {
	ReceivedSequence int64
	Level string
	Info	string
}

// WsContext definition 
type WsContext struct {
	Conn *websocket.Conn
	Db *sql.DB
	HandlerIndex int64
	HbtTicker *time.Ticker
	HbtHoldTimeOK bool
	HbtHoldDownTimer *time.Timer
	HbtHoldDownTime int64
	HbtInterval int64
	Sequence int64
	Verbose int
	SecUserID int64
	SecGroupIDs []int64
	SecToken int64
	Status WsStatus
}

type WsSQLSelect struct{
	Headers []string
	Data [][]string
}

// Services
// WebSocket Handler
// Gorilla websocket upgrader
var gorillaUpgrader = websocket.Upgrader{
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
	CheckOrigin:  func(r *http.Request) bool {
		for _, header := range r.Header["Origin"] {
			if strings.Contains(header,"st4rsend.net") {
				return true
			}
		}
		log.Printf("Origin header mismatch, received %v\n", r.Header["Origin"])
		return false
	},
}

var handlerIndex int64 = 0

//	Global rate limiter (milliseconds)
type GlobalLimiter struct {
	UserCreationRate int64
	UserCreationGranted bool
	UserLoginRate int64
	UserLoginGranted bool
}

type SpecificHandler struct {
	Limiter GlobalLimiter
}

//func WsHandler(w http.ResponseWriter, r *http.Request) {
func (limiters *SpecificHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var wsContext WsContext
	var err error

	log.Printf("Limiters: %v\n", limiters)

	wsContext.Conn, err = gorillaUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Upgrader error: %v\n", err)
		return
	}

	handlerIndex++

	wsContext.Sequence = 0
	wsContext.Verbose = ErrorLevel
	wsContext.HandlerIndex = handlerIndex
	wsContext.HbtHoldTimeOK = true
	wsContext.HbtInterval = 3
	wsContext.HbtHoldDownTime = 9

	wsContext.Db, err = ConnectSQL(user, password, host, port, database)
	CheckErr(err)
	defer wsContext.Db.Close()

	err = StartHBTSvc(&wsContext)
	CheckErr(err)
	err = StartHBTHoldDownTimer(&wsContext)
	CheckErr(err)

	if wsContext.Verbose > 4 {
		log.Printf("Handler %d activated\n", wsContext.HandlerIndex)
	}
	defer	func() {
		if wsContext.Verbose > 4 {
			log.Printf("Handler %d closed\n", wsContext.HandlerIndex);
		}
	}()

	defer StopHBTSvc(&wsContext)
	defer StopHBTHoldDownTimer(&wsContext)

	for {
		var receivedMessage WsMessage

		err := wsContext.Conn.ReadJSON(&receivedMessage)
		if err == nil {
			err := WsSrvParseMsg(&wsContext, &receivedMessage)
			CheckErr(err)
			if wsContext.Status.Level != "NONE" {
				err = sendStatus(&wsContext, &receivedMessage)
				if err != nil {
					log.Printf("Error sending status: %v",err)
				}
			}
			if err != nil {
				log.Printf("Error WsSrvparseMsg: %v",err)
			}
			if wsContext.Verbose > 6 {
				log.Printf("Received: %v\n", receivedMessage)
			}
		}
		if err != nil {
			if websocket.IsCloseError(err, 1005) {
				if wsContext.Verbose > 4 {
					log.Printf("Websocket closed by client for handler %d\n", wsContext.HandlerIndex)
				}
				break
			}
			if websocket.IsUnexpectedCloseError(err, 1005) {
				if wsContext.Verbose > 4 {
					log.Printf("Error WebSocket Unexpected close error code %v\nTODO: NEW close error case to be handled %d\n", err, wsContext.HandlerIndex)
				}
				break
			}
		}
		if wsContext.HbtHoldTimeOK == false {
			if wsContext.Verbose > 3 {
				log.Printf("Heartbeat holdtime timeout for handler %d\n", wsContext.HandlerIndex)
			}
			break
		}
		CheckErr(err)
	}
}

func WsSrvParseMsg(wsContext *WsContext, message *WsMessage) (err error){
	err = nil
	wsContext.Status.ReceivedSequence = message.Sequence
	wsContext.Status.Level = "NONE"
	wsContext.Status.Info = ""
	if message.Payload.Domain == "SQL" {
		err = WsSrvSQLParseMsg(wsContext, message)
		CheckErr(err)
		if err != nil {
			return err
		}
	}
	if message.Payload.Domain == "TODO" {
		err = WsSrvTodoWrapper(wsContext, message)
		CheckErr(err)
		if err != nil {
			return err
		}
	}

	if message.Payload.Domain == "DOC" {
		err = WsSrvDocWrapper(wsContext, message)
		CheckErr(err)
		if err != nil {
			return err
		}
	}
	if message.Payload.Domain == "CMD" {
		err = WsSrvCMDParseMsg(wsContext, message)
		CheckErr(err)
		if err != nil {
			return err
		}
	}
	if message.Payload.Domain == "HBT" {
		err = WsSrvHBTParseMsg(wsContext, message)
		CheckErr(err)
		if err != nil {
			return err
		}
	}
	if message.Payload.Domain == "INF" {
		err = WsSrvCMDParseMsg(wsContext, message)
		CheckErr(err)
		if err != nil {
			return err
		}
	}
	if message.Payload.Domain == "SEC" {
		err = WsSrvSecParseMsg(wsContext, message)
		CheckErr(err)
		if err != nil {
			return err
		}
	}
	return err
}

func WsSrvINFParseMsg(wsContext *WsContext, message *WsMessage) (err error){
	err = nil
	return err
}

func WsSrvCMDParseMsg(wsContext *WsContext, message *WsMessage) (err error){
	if message.Payload.Command == "VERBOSITY" {
		wsContext.Verbose, err = strconv.Atoi(message.Payload.Data[0])
		if wsContext.Verbose > 4 {
			log.Printf("Vervosity set to: %d for Handler %d\n", wsContext.Verbose, wsContext.HandlerIndex)
		}
	}
	return err
}

func sendMessage(wsContext *WsContext, payload *ComEncap) (err error){
	now := time.Now()
	message := WsMessage{
		Sequence: int64(wsContext.Sequence),
		Time: TimeStamp{
			SecSinceEpoch: now.Unix(),
			NanoSec: int64(now.Nanosecond())},
		Payload: *payload}
	err = wsContext.Conn.WriteJSON(&message)
	CheckErr(err)
	if wsContext.Verbose > 6 {
		log.Printf("Sending: %v\n", message)
	}

	wsContext.Sequence += 1
	return err
}

func sendStatus(wsContext *WsContext, message *WsMessage) (err error){
	message.Payload.ChannelID = 0
	message.Payload.Domain = "INF"
	message.Payload.Command = "APP_CTRL"
	message.Payload.Data = make ([]string, 3)
	message.Payload.Data[0] = strconv.FormatInt(wsContext.Status.ReceivedSequence, 10)
	message.Payload.Data[1] = wsContext.Status.Level
	message.Payload.Data[2] = wsContext.Status.Info
	err = sendMessage(wsContext, &message.Payload)
	CheckErr(err)
	log.Printf("Send status : %v\n", message.Payload)
	return err
}

