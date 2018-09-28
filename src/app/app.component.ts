import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { WebSocketService } from './shared/services/websocket.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {

  title = 'St4rsend';
  name: string = 'John';

	private isConnected: boolean = false;
	private isConnectedSub: Subscription;

	constructor( private webSocket: WebSocketService) {}

	ngOnInit() {
		this.isConnectedSub = this.webSocket.connected()
			.subscribe( x => { this.isConnected = x });
	}
	toAppComponent(msg: string) {
		console.log("AppComponent received msg: ",msg);
	}
}
