import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';


import { TodoService } from '../../shared/services/todo.service';
import { SqlListService, sqlList } from '../../shared/services/sql-list.service';
import { Todo } from '../../shared/model/todo';

import { WebSocketService } from '../../shared/services/websocket.service';

@Component({
  selector: 'app-update-todo',
  templateUrl: './update-todo.component.html',
  styleUrls: ['./update-todo.component.css'],
	providers: [ TodoService, SqlListService ],
})
export class UpdateTodoComponent implements OnInit {

	public todo: Todo;
	private userList: sqlList[]=[];

	public todoForm: FormGroup = new FormGroup({
		todoIDControl: new FormControl(null),
		todoUserControl: new FormControl(null),
		todoLabelControl: new FormControl(null),
		todoTargetDateControl: new FormControl(null),
		todoDoneDateControl: new FormControl(null),
		todoCompletedControl: new FormControl(null)
	});
	

  constructor(
		private todoService: TodoService, 
		private userListService: SqlListService,
		private webSocket: WebSocketService 
	) { 
		this.todo = new Todo(null,null,'label',null,null,false);
	}


  ngOnInit() {
		this.userList = this.userListService.getUsers();
		this.todoService.SQLSynchro();
		var todos: Todo[];
		todos = this.todoService.getTodos();
		console.log(todos);
		console.log(this.todoService.getTodo(38));
		//let items = [
		var items = [
      { id: 15, name: "first", grade: "A" },
      { id: 35, name: "second", grade: "B" },
      { id: 50, name: "third", grade: "B" }
     ];
		console. log(items);
		console.log(typeof(items));
		console.log(items.find( x => x.id == 35));
  }

	onSubmit() {
		console.log("Submitting form");
	}
	emitTodo(todo: Todo) {
		//this.todoService.updateTodo(todo);
	}

}
