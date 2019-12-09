// Объект для формирования объектов управления домом
const controllers = {
	controllersBlock: document.querySelector('.controllers__items'),
	items: ['Реле 0', 'Реле 1', 'ШИМ Модулятор 0', 'ШИМ Модулятор 1', 'Выход 0', 'Выход 1'],
	thisLabel: 0,
	waitForServer: false,
	currentState: [],
	receivedState: [],

	init(){
		this.getData()
		if(!this.waitForServer){
			setTimeout(()=>{
				this.createControllers()
				this.checkState()
				this.changeCheckState()
			},500)
		}	
	},
	// создание разметки
	createControllers (){
		this.items.forEach((val,i) => {
			this.controllersBlock.insertAdjacentHTML('beforeEnd', `
				<article>
					<section>${val}</section>
					<section>
						<label class ="checkbox" for="label_${this.thisLabel}">
						<input type="checkbox" id="label_${this.thisLabel}" name="label_${this.thisLabel}" ${this.addControllerState(i)} onclick='controllers.addCheckAttr(event)'>
						<div class="checkbox__text"></div>
						<label>
					</section>
					<section>Выкл.</section>
				</article>
			`);
			this.thisLabel++;
		})
	},
	// Добавляет значение checked в зависимости от текущего состояния
	addControllerState (index){  
		this.getData();
		if(this.receivedState[index] == true){
			return 'checked';
		} return '';
	},

	checkState() {
		for (let i = 0; i < this.items.length; i++) {
			let currCheckbox = document.getElementById(`label_${i}`)
			if(currCheckbox.hasAttribute('checked')){
				this.currentState[i] = true;
			} else {
				this.currentState[i] = false;
			}
		}
	},
	// Проверка наличия атрибута checked
	addCheckAttr(e) {
		if(e.currentTarget.hasAttribute('checked')){
			e.currentTarget.removeAttribute('checked');
			
		} else {
			e.currentTarget.setAttribute('checked', '')
		}
		this.checkState()
		this.makeJSON(this.currentState)
		this.changeCheckState()
		console.log(this.currentState);
		
	},

	changeCheckState() {
		let checkboxArr = document.querySelectorAll('input[type="checkbox"]');
		checkboxArr.forEach((val,i) => {
			if(this.currentState[i] == false){
				checkboxArr[i].parentElement.parentElement.nextElementSibling.innerText = 'Выкл.'
			} else{
				checkboxArr[i].parentElement.parentElement.nextElementSibling.innerText = 'Вкл.'
			}

		})
	},

	makeJSON(arr){
		const stateObj = {
			currentState: arr,
		};
		
		let jsonInfo = JSON.stringify(stateObj);
		this.sendData(jsonInfo)
		console.log(jsonInfo);	
		return jsonInfo;
	},
//для отправки данных 
	sendData(data) {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/request', true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		xhr.send(data);
		console.log('sent');
		
	},
//Загрузка с сервера данных и обновление массива состояний
	getData(){
		let getJSON = fetch('/request/currState.json',)
		.then(response => response.json())
		.then(data => {
			this.receivedState = [...data.state]
			this.waitForServer = true
			return this.receivedState
		})
	},

};

	//Вывод даты и время
function writeDateAndTime() {
	let dateInfo = new Date(),
	currentDay = dateInfo.getDate(),
	currentMonth = dateInfo.getMonth(),
	monthNames = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
	currentMonthName = monthNames[currentMonth],
	currentYear = dateInfo.getFullYear(),
	currentHours = dateInfo.getHours(),
	currentMinutes = dateInfo.getMinutes(),
	currentSeconds = dateInfo.getSeconds();

	if(currentMinutes > 0 && currentMinutes < 10){
		currentMinutes = `0${currentMinutes}`
	}
	
	if(currentSeconds >= 0 && currentSeconds < 10){
		currentSeconds = `0${currentSeconds}`
	}

	let datePlace = document.querySelector('.info__time-date');
	datePlace.innerHTML = `${currentDay} ${currentMonthName} ${currentYear}, ${currentHours}:${currentMinutes}:${currentSeconds}`
}

// Подключение к API погоды
let requestURL = 'http://api.weatherstack.com/current?access_key=3d0f402d3ab46821b7c3b5df4288e975&query=Moscow';
let request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload =  () => {
	let weatherInfo = request.response;
	let weatherPlace = document.querySelector('.info__weather');
	weatherPlace.innerHTML = `Москва ${weatherInfo.current.temperature}&deg;C`;
};

//Время чтоб шло в реальном времени
setInterval(() => {return writeDateAndTime()},100); 
controllers.init(); //Элементы управления 
