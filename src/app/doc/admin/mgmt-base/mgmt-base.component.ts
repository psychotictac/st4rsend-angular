import { Component, OnInit,
	ViewChild,
	ViewContainerRef,
	ComponentFactoryResolver,
	ComponentRef,
	ComponentFactory, 
} from '@angular/core';
import { DocService } from '../../service/doc.service';
import { ArticleShort } from '../../model/doc';

import { EditItemDocComponent } from '../../view/edit-item-doc/edit-item-doc.component';

@Component({
  selector: 'app-mgmt-base',
  templateUrl: './mgmt-base.component.html',
  styleUrls: ['./mgmt-base.component.scss'],
	providers: [ DocService ],
})

export class MgmtBaseComponent implements OnInit {

	public docListEditMode: boolean = false;
	public docListTable: string = 'documentation_list';
	public docListIDName: string = 'ID';
	public docListColumn = 'description';
	public docListPosition = 'position';
	public docListFilter = 'themeID';

	public docThemeListEditMode: boolean = false;
	public docThemeListTable: string = 'documentation_theme';
	public docThemeListIDName: string = 'ID';
	public docThemeListColumn = 'description';
	public docThemeListPosition = 'position';

	public docDisplayListEditMode: boolean = false;
	public docDisplayListTable: string = 'documentation_display';
	public docDisplayListIDName: string = 'ID';
	public docDisplayListColumn = 'display';
	public docDisplayListPosition = 'position';

	public listKey: string = "0";
	public listTargetKey: string = "0";
	public themeTargetKey: string = "";
	public themeEdit: string = "Change theme";
	public themeEditFlag: boolean = false;

	public articlesShort: Array<ArticleShort>;
	public articleListID: number;
	public articleToListFlag: boolean = false;
	public addArticleToListTarget: string = "0";

	public articleID: string="0";

	articleEditComponentRef: any;
	@ViewChild('articleEditContainer', { static: true, read: ViewContainerRef }) EditItemDocComponent: ViewContainerRef;

  constructor(
		private docService: DocService,
		private resolver: ComponentFactoryResolver,) {
		this.docService.isReady$.subscribe(
			ready => {
				if (ready) {
					this.articlesShort = this.docService.getArticlesShort(this.articleListID);
				}
			});	 
	}

  ngOnInit() {
  }

	docListCloseEvent(value: boolean) {
		this.docListEditMode = value;
	}

	listFinderEvent(listID: string) {
		this.listKey = listID;
		this.docService.SelectArticlesShort(this.listKey);
		this.themeEditFlag = false;
		this.themeEdit = "Change theme";
		this.articleID = "0";
	}

	docListEdit(){
		this.docListEditMode = !this.docListEditMode;
	}

	docThemeListEdit(){
		this.docThemeListEditMode = !this.docThemeListEditMode;
	}

	docThemeListCloseEvent(value: boolean) {
		this.docThemeListEditMode = value;
	}

	docDisplayListEdit(){
		this.docDisplayListEditMode = !this.docDisplayListEditMode;
	}

	docDisplayListCloseEvent(value: boolean) {
		this.docDisplayListEditMode = value;
	}

	themeEditChange() {
		this.themeEditFlag = !this.themeEditFlag;
		if(this.listKey == "0") {
			this.themeEditFlag = false;
		}
		if (this.themeEditFlag) {
			this.themeEdit="Cancel";
		} else {
			this.themeEdit="Change theme";
		}
	}

	articleChange() {
		this.articleToListFlag = false;
		this.addArticleToListTarget = "0";
	}

	themeTargetChange($event: string) {
		this.themeTargetKey = $event;
		console.log("Target Theme: ", this.themeTargetKey);
	}

	moveListToTheme() {
		this.docService.SetListTheme(this.listKey, this.themeTargetKey);
	}

	delArticleFromList() {
		this.docService.DelArticleFromList(this.articleID.toString(), this.listKey);
	}

	addArticleToList() {
		this.articleToListFlag = true;
	}

	addArticleToListCancel() {
		this.articleToListFlag = false;
	}
	addArticleToListConfirm() {
		if (this.addArticleToListTarget != "0" 
			&& this.addArticleToListTarget !="-1") {
			this.docService.AddArticleToList(this.articleID.toString(), this.addArticleToListTarget);
		}
		this.articleChange();
	}

	addArticleToListFinderEvent(listID: string) {
		this.addArticleToListTarget = listID;
	}

	articleEdit() {
		console.log("Editing article: ", this.articleID);
		this.EditItemDocComponent.clear();
		const factory = this.resolver.resolveComponentFactory(EditItemDocComponent);
		this.articleEditComponentRef = this.EditItemDocComponent.createComponent(factory);
		this.articleEditComponentRef.instance.itemDocIdx = this.articleID;
		this.articleEditComponentRef.instance.itemDocCloseEvent.subscribe(
			value => {
				 this.itemDocCloseEvent(value);
			});
	}

	itemDocCloseEvent(altered: boolean) {
		console.log("destroying");
		this.articleEditComponentRef.destroy();
	}
}
