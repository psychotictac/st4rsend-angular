package st4rsend

import (
	"fmt"
	"strconv"
	"context"
	"database/sql"
)

type Doc struct {
	idx string
	typeID string
	position string
	value string
	description string
}

func WsSrvDocWrapper(wsContext *WsContext, message *WsMessage) (err error){
	err = nil
	if message.Payload.Command == "GET_DOC_BY_ID" {
		err = WsSrvGetDocByID(wsContext, message)
	}
	if message.Payload.Command == "GET_DOC_LIST" {
		err = WsSrvGetDocList(wsContext, message)
	}
	if message.Payload.Command == "GET_DOC_TYPE" {
		err = WsSrvGetDocType(wsContext, message)
	}
	if message.Payload.Command == "INSERT_DOC" {
		err = WsSrvDocInsert(wsContext, message)
	}
	if message.Payload.Command == "UPDATE_DOC" {
		err = WsSrvDocUpdate(wsContext, message)
	}
	CheckErr(err)
	return err
}

func WsSrvDocUpdate(wsContext *WsContext, message *WsMessage) (err error){
	err = nil
	var doc Doc
	var sqlText string
	doc.idx = message.Payload.Data[0]
	doc.typeID = message.Payload.Data[1]
	doc.description = message.Payload.Data[2]
	doc.value = message.Payload.Data[3]
	sqlText = "update documentations set typeID=?, description=?, info=? where ID=?"
	if (wsContext.Verbose > 4) {
		fmt.Printf("\nProcessing SQL Doc update: %+v\n",sqlText)
	}
	localContext := context.Background()
	err = wsContext.Db.PingContext(localContext)
	CheckErr(err)
	_, err = wsContext.Db.ExecContext(localContext,sqlText,
		doc.typeID,
		doc.description,
		doc.value,
		doc.idx)
	CheckErr(err)
	return err
}

func WsSrvDocInsert(wsContext *WsContext, message *WsMessage) (err error){
	err = nil
	var doc Doc
	var listID string
	var position string
	var sqlText string
	var sqlResult sql.Result
	doc.typeID = message.Payload.Data[0]
	doc.description = message.Payload.Data[1]
	doc.value = message.Payload.Data[2]
	listID = message.Payload.Data[3]
	position = message.Payload.Data[4]

	localContext := context.Background()
	err = wsContext.Db.PingContext(localContext)
	CheckErr(err)
	sqlText = "insert into documentations (typeID, description, info) values (?,?,?)"
	if (wsContext.Verbose > 4) {
		fmt.Printf("Processing SQL documentations Insert\n")
	}
	sqlResult, err = wsContext.Db.ExecContext(localContext,sqlText,
		doc.typeID,
		doc.description,
		doc.value)
	CheckErr(err)
	lastID, err := sqlResult.LastInsertId()
	sqlText = "insert into documentation_set (listID, docID, position) values (?,?,?)"
	if (wsContext.Verbose > 4) {
		fmt.Printf("Processing SQL documentation_set\n")
	}
	_, err = wsContext.Db.ExecContext(localContext,sqlText,
		listID,
		strconv.FormatInt(lastID, 10),
		position)
	CheckErr(err)
	return err

}

func WsSrvGetDocByID(wsContext *WsContext, message *WsMessage) (err error){
	var response *WsSQLSelect
	err = nil
	var sqlText string
	localContext := context.Background()
	err = wsContext.Db.PingContext(localContext)
	CheckErr(err)
	sqlText = "select D.ID, T.ID as typeID, T.type, S.position, D.info, D.description from documentation_list L left join documentation_set S on L.ID=S.listID left join documentations D on S.docID=D.ID left join documentation_type T on D.typeID=T.ID where L.ID=? order by S.position;"
	rows, err := wsContext.Db.QueryContext(localContext, sqlText,
		message.Payload.Data[0])
	CheckErr(err)
	defer rows.Close()

	response, err = rowsToWsSQLSelect(rows)

	message.Payload.Command = "RESP_DOC_BY_ID"
	for _, line := range response.Data {
		message.Payload.Data = line
		err = sendMessage(wsContext, &message.Payload)
		CheckErr(err)
	}
	message.Payload.Command = "EOF"
	message.Payload.Data = nil
	err = sendMessage(wsContext, &message.Payload)
	CheckErr(err)
	return err
}

func WsSrvGetDocList(wsContext *WsContext, message *WsMessage) (err error){
	var response *WsSQLSelect
	err = nil
	var sqlText string
	localContext := context.Background()
	err = wsContext.Db.PingContext(localContext)
	CheckErr(err)
	sqlText = "select L.ID, L.description from documentation_list L"
	rows, err := wsContext.Db.QueryContext(localContext, sqlText)
	CheckErr(err)
	defer rows.Close()

	response, err = rowsToWsSQLSelect(rows)

	message.Payload.Command ="RESP_DOC_LIST"
	for _, line := range response.Data {
		message.Payload.Data = line
		err = sendMessage(wsContext, &message.Payload)
		CheckErr(err)
	}
	message.Payload.Command = "EOF"
	message.Payload.Data = nil
	err = sendMessage(wsContext, &message.Payload)
	CheckErr(err)
	return err
}

func WsSrvGetDocType(wsContext *WsContext, message *WsMessage) (err error){
	var response *WsSQLSelect
	err = nil
	var sqlText string
	localContext := context.Background()
	err = wsContext.Db.PingContext(localContext)
	CheckErr(err)
	sqlText = "select T.ID, T.type from documentation_type T"
	rows, err := wsContext.Db.QueryContext(localContext, sqlText)
	CheckErr(err)
	defer rows.Close()

	response, err = rowsToWsSQLSelect(rows)

	message.Payload.Command ="RESP_DOC_TYPE"
	for _, line := range response.Data {
		message.Payload.Data = line
		err = sendMessage(wsContext, &message.Payload)
		CheckErr(err)
	}
	message.Payload.Command = "EOF"
	message.Payload.Data = nil
	err = sendMessage(wsContext, &message.Payload)
	CheckErr(err)
	return err
}
