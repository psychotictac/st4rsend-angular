import { Component, OnInit } from '@angular/core';
import {DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-svg-sample',
  templateUrl: './svg-sample.component.html',
  styleUrls: ['./svg-sample.component.css']
})
export class SvgSampleComponent implements OnInit {

	svg:SafeHtml;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
		this.svg = this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="761px" height="561px" viewBox="-0.5 -0.5 761 561" style="background-color: rgb(255, 255, 255);"><defs/><g><rect x="0" y="80" width="760" height="480" fill="#ffffff" stroke="#000000" pointer-events="none"/><rect x="280" y="220" width="120" height="60" rx="9" ry="9" fill="#ffffff" stroke="#000000" pointer-events="none"/><g transform="translate(310.5,243.5)"><switch><foreignObject style="overflow:visible;" pointer-events="all" width="58" height="12" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; width: 58px; white-space: nowrap; overflow-wrap: normal; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;">TRANTOR</div></div></foreignObject><text x="29" y="12" fill="#000000" text-anchor="middle" font-size="12px" font-family="Helvetica">TRANTOR</text></switch></g><rect x="90" y="390" width="120" height="60" rx="9" ry="9" fill="#ffffff" stroke="#000000" pointer-events="none"/><g transform="translate(118.5,413.5)"><switch><foreignObject style="overflow:visible;" pointer-events="all" width="62" height="12" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 12px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; width: 64px; white-space: nowrap; overflow-wrap: normal; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;">TERMINUS</div></div></foreignObject><text x="31" y="12" fill="#000000" text-anchor="middle" font-size="12px" font-family="Helvetica">TERMINUS</text></switch></g><g transform="translate(203.5,-0.5)"><switch><foreignObject style="overflow:visible;" pointer-events="all" width="342" height="41" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 36px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; width: 344px; white-space: nowrap; overflow-wrap: normal; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;">St4rsend architecture</div></div></foreignObject><text x="171" y="39" fill="#000000" text-anchor="middle" font-size="36px" font-family="Helvetica">St4rsend architecture</text></switch></g><g transform="translate(120.5,134.5)"><switch><foreignObject style="overflow:visible;" pointer-events="all" width="488" height="41" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; font-size: 36px; font-family: Helvetica; color: rgb(0, 0, 0); line-height: 1.2; vertical-align: top; width: 490px; white-space: nowrap; overflow-wrap: normal; text-align: center;"><div xmlns="http://www.w3.org/1999/xhtml" style="display:inline-block;text-align:inherit;text-decoration:inherit;">GoogleCloud Compute Engine</div></div></foreignObject><text x="244" y="39" fill="#000000" text-anchor="middle" font-size="36px" font-family="Helvetica">GoogleCloud Compute Engine</text></switch></g></g></svg>');
  }

}