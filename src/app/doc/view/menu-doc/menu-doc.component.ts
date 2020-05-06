import { Component, OnInit, Output, EventEmitter, HostBinding } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DocService } from '../../service/doc.service';
import { GlobalService } from '../../../shared/service/global.service';

import { ListSelectComponent } from '../../../shared/component/list-select/list-select.component';

const ANIMATION_TIMINGS = '400ms cubic-bezier(0.25, 0.8, 0.25, 1)';

@Component({
  selector: 'app-menu-doc',
  templateUrl: './menu-doc.component.html',
  styleUrls: ['./menu-doc.component.scss'],
	animations: [
		trigger('slideContent', [
			state('void', style({transform: 'translateY(-100%)'})),
			state('enter', style({transform: 'translateY(0)'})),
			state('leave', style({transform: 'translateY(-100%)'})),
			transition('* => *', animate(ANIMATION_TIMINGS)),
		])
	]
})
export class MenuDocComponent implements OnInit {

	@Output() editModeEvent = new EventEmitter<boolean>();
	@Output() viewModeEvent = new EventEmitter<string>();

	animationState: 'void' | 'enter' | 'leave' = 'void';

	public docEditMode: boolean = false;
	public viewMode: string = 'normal';

	public statusBarHeight: string;

	public navFilter: boolean = true;
	public navMap: boolean = false;
	public navOptions: boolean = false;
	public navMode: boolean = false;

  constructor(
		private docService: DocService,
		private globalService: GlobalService,
	) { }

	navigatorClick(state) {
		this.animationState = state;
	}

  ngOnInit() {
/*
		this.docList.isReady$.subscribe(
			ready => {
				if ( ready ) {
					this.docList.listID = this.docList.list[0].key;
					this.docListChange({key: this.docList.listID, value:""});
				}
			});
*/
		this.docService.articleFocus$.subscribe(
			val => {
				if (val) {
					this.navigatorClick("leave");
				}
			});

		this.globalService.statusLineCount$.subscribe(
			count => {
				this.statusBarHeight =  "calc(" + ( count ) + "em)";
			}
		);
  }

	public mouseEnter() {
		this.docService.cancelOverArticleTimeout();
	}

	public setTabMode() {
		this.navMode = true;
		this.navFilter = false;
		this.navMap = false;
		this.navOptions = false;
	}
	
	public setTabMap() {
		this.navMode = false;
		this.navFilter = false;
		this.navMap = true;
		this.navOptions = false;
	}

	public setTabFilter() {
		this.navMode = false;
		this.navFilter = true;
		this.navMap = false;
		this.navOptions = false;
	}

	public setTabOptions() {
		this.navMode = false;
		this.navFilter = false;
		this.navMap = false;
		this.navOptions = true;
	}

	docRefresh() {
		this.docService.refresh();
	}	

	editModeChange() {
		this.editModeEvent.emit(this.docEditMode);
	}

	viewModeChange() {
		this.viewModeEvent.emit(this.viewMode);
	}

	newArticle() {
		this.docService.articleEdit(null);
	}
}
