import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Doc } from '../../shared/model/doc';

@Component({
  selector: 'app-url-svg-item-doc',
  templateUrl: './url-svg-item-doc.component.html',
  styleUrls: ['./url-svg-item-doc.component.css']
})
export class UrlSvgItemDocComponent implements OnInit {

	@Input() itemDoc: Doc;
	@Input() editMode: boolean;

	svg: SafeHtml;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
		this.svg=this.sanitizer.bypassSecurityTrustResourceUrl(this.itemDoc.value);
  }

}
