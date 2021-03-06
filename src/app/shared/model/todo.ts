export interface ITodo {
	idx: number;
	userID: number;
	user: string;
	label: string;
	targetDate: string;
	doneDate: string;
	completed: boolean;
}

export class Todo implements ITodo {
	
	constructor (
		public idx: number,
		public userID: number,
		public user: string,
		public label: string,
		public targetDate: string,
		public doneDate: string,
		public completed: boolean
	){}

/*
	public getIdx(): number {
		return this.idx;
		console.log("idx: ",this);
	}
*/
	public doneInTime(): boolean {
		return this.doneDate <= this.targetDate;
	}
}
