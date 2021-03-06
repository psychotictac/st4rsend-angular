import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Subscription, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

interface timeStamp {
  secSinceEpoch : number;
  nanoSec : number;
}

interface comEncap {
  channelid : number;
  domain : string;
  command : string;
  data : string[]
}

export interface wsMessage {
  sequence : number;
  time : timeStamp;
  payload : comEncap;
}

@Injectable({
	providedIn: 'root'
})

export class WebSocketService {


	private isConnected: boolean = false;
	private wsConnected$ = new BehaviorSubject<boolean>(false);
	private currentSeq: number = 1;
	private backendMsgSubject = new Subject<any>();

	public webSocketSubject: WebSocketSubject<wsMessage>;
	private webSocketSubscription: Subscription;
	private trackSubs: Subscription[];

	private messages: Array<string>;

	private hbtInterval: number = 3000;
	private hbtTicker: number;
	private hbtHoldTime: number = 9000;
	private hbtHoldTicker: number;

  constructor() { 
		this.messages = [];
		this.trackSubs = [];
	}

	public connected$ = this.wsConnected$.asObservable();
	public backendMsg$ = this.backendMsgSubject.asObservable();

	public prepareMessage(channelid: number, domain: string, command: string, data: string[]): wsMessage {
		let message: wsMessage = {
			sequence: this.currentSeq,
			time: {
				secSinceEpoch: Math.floor(Date.now()/1000),
				nanoSec: (Date.now() % 1000) * 1000000
			},
			payload: {
				channelid: channelid,
				domain: domain,
				command: command,
				data: data
			},
		}
		this.currentSeq++;
		return message;
	}

	public connect(url: string){
		this.webSocketSubject = webSocket(url);
		this.webSocketSubscription = this.webSocketSubject.subscribe(
			(msg) => this.webSocketParse(msg),
			(err) => this.socketError(err),
			() => this.wsConnected$.next(false) // called when con closed
		);
		this.hbtTicker = setInterval(
			() => {
				this.webSocketSubject.next(this.prepareMessage(0,"HBT","HBTINF",[]));
			},this.hbtInterval
		);
		this.hbtHoldTicker = setTimeout(
			() => {
				this.hbtHoldFail();
			}, this.hbtHoldTime
		);
	}

	public sendMessage(
			channel: number,
			domain: string,
			command: string,
			data: string[],
			parserFct: Function) {
		if((this.trackSubs[channel] != undefined) 
		// returns false if subscription conflict, else true.
				&& (this.trackSubs[channel].closed == false)){
			return false;
		}
		this.trackSubs[channel] = this.webSocketSubject.subscribe(
			(msg: wsMessage) => {
				if ((msg.payload.channelid == channel)
				&& (msg.payload.domain == domain)) {
					if (msg.payload.command == "EOF") {
						this.trackSubs[channel].unsubscribe();
					}
					else {
						parserFct(msg)
					};
				}
			});
		this.webSocketSubject.next(this.prepareMessage(channel, domain, command, data));
		return true;
	}

	public disconnect(){
		this.currentSeq = 1;
		clearInterval(this.hbtTicker);
		clearTimeout(this.hbtHoldTicker);
		this.webSocketSubscription.unsubscribe();
		this.webSocketSubject.complete();
		this.isConnected = false;
		this.wsConnected$.next(false);
	}

	public setServerVerbosity(value: string) {
		this.messages = [];
		this.messages.push(JSON.stringify(parseInt(value)));
		let message =  this.prepareMessage(0,"CMD","VERBOSITY",this.messages);
		if (this.webSocketSubject != null) {
			this.webSocketSubject.next(message);
		}
	}

	public webSocketParse(msg: wsMessage){
		if(!this.isConnected) {
			this.isConnected =  true;
			this.wsConnected$.next(true);
		}
		if  ((+msg.payload.channelid === 0) && (msg.payload.domain === "HBT")) {
			clearTimeout(this.hbtHoldTicker);	
			this.hbtHoldTicker = setTimeout(() => {
				this.hbtHoldFail();
			}, this.hbtHoldTime);
		}
		if  ((+msg.payload.channelid === 0) && (msg.payload.domain === "INF")) {
			this.backendMsgSubject.next(msg);
		}
	}

	private socketError(err) {
		console.log("Socket Error: ", err);
		clearTimeout(this.hbtHoldTicker);	
		this.isConnected = false;
		this.wsConnected$.next(false);
	}

	private hbtHoldFail() {
		console.log("ALERT HBT HOLDTIME EXPIRED !!!");
		clearTimeout(this.hbtHoldTicker);	
		this.disconnect();
	}
}
