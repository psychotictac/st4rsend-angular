import { Component,
	OnInit, Input, Output, EventEmitter,
	ViewChild, ViewContainerRef,
	ComponentFactoryResolver } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

import { DocService } from '../../service/doc.service';
import { Doc } from '../../model/doc';
import { SqlListService, ISqlList } from '../../../shared/service/sql-list.service';
import { EditTextareaDocComponent } from '../edit-textarea-doc/edit-textarea-doc.component';

@Component({
	selector: 'app-edit-item-doc',
	templateUrl: './edit-item-doc.component.html',
	styleUrls: ['./edit-item-doc.component.scss'],
	providers: [ SqlListService ],
})
export class EditItemDocComponent implements OnInit {

	@Input() itemDoc: Doc;
	@Input() itemDocIdx: number;
	@Output() itemDocCloseEvent = new EventEmitter<boolean>();

	public docTypes: Array<ISqlList>;
	public docTypeKey: string = 'type';
	public docTypeTable: string = 'documentation_type';
	public docTypeIDName: string = 'ID';
	public docTypeColumn: string = 'type';
	public docTypePosition: string = 'position';

	public docDisplays: Array<ISqlList>;
	public docDisplayKey: string = 'display';
	public docDisplayTable: string = 'documentation_display';
	public docDisplayIDName: string = 'ID';
	public docDisplayColumn: string = 'display';
	public docDisplayPosition: string = 'position';

	private creation: boolean;
	public doc: Doc;
	public docTypeID: number;
	public docType2ID: number;
	public listTypeSelected: boolean;
	public listType2Selected: boolean;

	public docDisplayID: number;

	public editStyles;

	editTextareaComponentRef: any;
	@ViewChild('editTextareaContainer',	{ static: true, read: ViewContainerRef }) EditTextareaDocComponent: ViewContainerRef;


  constructor(
		private sanitizer: DomSanitizer,
		private editTextareaResolver: ComponentFactoryResolver,
		private docService: DocService,
		private docListService: SqlListService,) {
		}

  ngOnInit() {
		this.docListService.InitListKey(
			this.docTypeKey,
			this.docTypeTable,
			this.docTypeIDName,
			this.docTypeColumn,
			this.docTypePosition);
		this.docTypes = this.docListService.GetListKey(this.docTypeKey);
		this.docListService.InitListKey(
			this.docDisplayKey,
			this.docDisplayTable,
			this.docDisplayIDName,
			this.docDisplayColumn,
			this.docDisplayPosition);
		this.docDisplays = this.docListService.GetListKey(this.docDisplayKey);
		this.reset();
		
		if (this.doc.typeID == 4) {
			this.listTypeSelected = true;
		} else {
			this.listTypeSelected = false;
		}
		if (this.doc.type2ID == 4) {
			this.listType2Selected = true;
		} else {
			this.listType2Selected = false;
		}
		this.editStyles = {
			"top": "5%",
			"left": "5%",
			"width": "90%",
			"height": "90%",
			//"width": "'calc (100vw -50px)'",
		};

		if (this.itemDocIdx != null) {
			this.docService.SelectArticlesByID(this.itemDocIdx);
			this.docService.isReadyArticle$.subscribe(
				ready => {
					if (ready) {
						this.itemDoc = this.docService.getArticle();
						this.reset();
					}
				}
			);
		}
  }

	cancel() {
		this.itemDocCloseEvent.emit(false);
	}

	validate() {
		if (this.doc.idx == 0){
			this.docService.dsInsertDoc(this.doc);
		} else {
			this.docService.dsUpdateDoc(this.doc);
		}
		this.itemDocCloseEvent.emit(true);
	} 

	docTypeChange() {
		this.doc.typeID = this.docTypeID;
		if (this.docTypeID == 4) {
			this.listTypeSelected = true;
		} else {
			this.listTypeSelected = false;
		}
	}
	docType2Change() {
		this.doc.type2ID = this.docType2ID;
		if (this.docType2ID == 4) {
			this.listType2Selected = true;
		} else {
			this.listType2Selected = false;
		}
	}
	docDisplayChange() {
		this.doc.displayID = this.docDisplayID;
	}

	selectedListEvent(list: {key: number, value: string}) {
		this.doc.childListID = list.key;
	}
	selectedList2Event(list: {key: number, value: string}) {
		this.doc.child2ListID = list.key;
	}

	reset() {
		if (this.itemDoc !=null){
			this.creation = false;
			this.docTypeID = this.itemDoc.typeID;
			this.docType2ID = this.itemDoc.type2ID;
			this.docDisplayID = this.itemDoc.displayID;
			this.doc = { ...this.itemDoc};
		} else {
			this.creation = true;
			this.doc = new Doc(0, 0, "", 1, "TEXT", "", 0, 1, "TEXT", "", 0, 1, "Double");
			this.docTypeID = 1;
			this.docType2ID = 1;
		}
		this.docTypeChange();
		this.docType2Change();
	}

	fromFileA(file) {
		var loader = new FileReader();
		console.log("FILE: ", file);
		loader.readAsText(file.target.files[0]);
		loader.onload = (e) => {
			this.doc.value = loader.result as string;
		}
	}
	fromFileB(file) {
		var loader = new FileReader();
		console.log("FILE: ", file);
		loader.readAsText(file.target.files[0]);
		loader.onload = (e) => {
			this.doc.value2 = loader.result as string;
		}
	}

	public valueDoubleClick() {
		this.EditTextareaDocComponent.clear();
		const factory = this.editTextareaResolver.resolveComponentFactory(EditTextareaDocComponent);
		this.editTextareaComponentRef = this.EditTextareaDocComponent.createComponent(factory);
		this.editTextareaComponentRef.instance.text = this.doc.value;
		this.editTextareaComponentRef.instance.textareaCloseEvent.subscribe(
			value => {
				this.editTextareaCloseEvent(value);
			}
		);
	}

	public value2DoubleClick() {
		this.EditTextareaDocComponent.clear();
		const factory = this.editTextareaResolver.resolveComponentFactory(EditTextareaDocComponent);
		this.editTextareaComponentRef = this.EditTextareaDocComponent.createComponent(factory);
		this.editTextareaComponentRef.instance.text = this.doc.value2;
		this.editTextareaComponentRef.instance.textareaCloseEvent.subscribe(
			value => {
				this.editTextarea2CloseEvent(value);
			}
		);
	}

	public editTextareaCloseEvent(value: string) {
		if ( value != undefined ) {
			this.doc.value = value;
		}
		this.editTextareaComponentRef.destroy();
	}

	public editTextarea2CloseEvent(value: string) {
		if ( value != undefined ) {
			this.doc.value2 = value;
		}
		this.editTextareaComponentRef.destroy();
	}
}
