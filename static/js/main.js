// This function is to initialize the application
function init() {
    submitButton();
    loginButton();
    registerButton();
    makeCardsDragAndDroppable();
    makeBoardAddingButtonFunctional();
    newColumnButtonPress();
    newCardButtonPress();
    makeTitleEditable();
    deleteButton();
    boardOpener();
    openedBoardHandler();
}

function boardOpener()
{
    let boardOpenerElements = document.getElementsByClassName('board-opener');
    for(let boardOpenerElement of boardOpenerElements)
    {
        boardOpenerElement.addEventListener('click', function() { openBoard(event.target.parentElement.parentElement) });
    }
}


function openBoard(board)
{
    board.firstElementChild.nextElementSibling.hidden = false;
    let board_id = Number(board.id);
    document.cookie = `${board_id}=`;
    document.cookie = `${board_id}=opened`;
    changeArrowToUpside(board.firstElementChild.firstElementChild.nextElementSibling);
}


function changeArrowToUpside(downsideArrow)
{
    let upsideArrow = document.createElement('i');
    upsideArrow.classList.add('fas');
    upsideArrow.classList.add('fa-angle-up');
    downsideArrow.parentElement.replaceChild(upsideArrow, downsideArrow);
    upsideArrow.addEventListener('click', function() { closeBoard(event.target.parentElement.parentElement) })
}


function closeBoard(board)
{
    board.firstElementChild.nextElementSibling.hidden = true;
    let board_id = Number(board.id);
    document.cookie = `${board_id}=`;
    document.cookie = `${board_id}=closed`;
    changeArrowToDownside(board.firstElementChild.firstElementChild.nextElementSibling);
}


function changeArrowToDownside(upsideArrow)
{
    let downsideArrow = document.createElement('i');
    downsideArrow.classList.add('fas');
    downsideArrow.classList.add('fa-angle-down');
    upsideArrow.parentElement.replaceChild(downsideArrow, upsideArrow);
    downsideArrow.addEventListener('click', function() { openBoard(event.target.parentElement.parentElement) })
}


function makeCardsDragAndDroppable() {
    for(let i=0; i<document.getElementsByClassName('container').length; i++)
    {
        let columns = [];
        for(let j=0; j<document.getElementsByClassName('container')[i].getElementsByClassName('cards_column').length; j++)
        {
            columns.push(document.getElementById(`${String(i)+String(j)}`));
        }
        let drake = dragula(columns);
        drake.on('drop', handleCardMoving);
    }
}


function makeBoardAddingButtonFunctional()
{
    let boardAddingButton = document.getElementById('add-board');
    boardAddingButton.addEventListener('click', createNewBoard);
}


function createNewBoard()
{
    document.getElementById('add-board').disabled = true;
    createInputForNewBoard()
}


function createInputForNewBoard()
{
    document.getElementById('new-board-input').hidden = false;
    let createButton = document.getElementById('create-board');
    let cancelButton = document.getElementById('cancel-board');
    createButton.addEventListener('click', registerNewBoard);
    cancelButton.addEventListener('click', closeInput);
}


function registerNewBoard() {
    let boardName = document.getElementById('new-board-name').value;
    let boardType;
    if (document.getElementById('private-checkbox') !== null) {
        boardType = document.getElementById('private-checkbox').checked ? 'private' : 'public';
    }
    else
    {
        boardType = 'public';
    }

    sendBoardDataToServer(boardName, boardType);
    closeInput();
}


function sendBoardDataToServer(boardName, boardType)
{
    const url = '/board';
    const userInput = {boardName: boardName, boardType: boardType};

    fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(userInput)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.attempt === 'successful')
        {
            reloadPageBoard()
        }
    });
}


function reloadPageBoard()
{
    fetch('/')
        .then((response) => response.text())
        .then((response) => switchContentBoard(response))
}


function switchContentBoard(response)
{
    let fakeDiv = document.createElement('div');
    fakeDiv.innerHTML = response;
    let newBoardsSpace = fakeDiv.getElementsByClassName('boards-space')[0];
    let oldBoardsSpace = document.getElementsByClassName('boards-space')[0];
    oldBoardsSpace.parentElement.replaceChild(newBoardsSpace, oldBoardsSpace);
    makeCardsDragAndDroppable();
    makeBoardAddingButtonFunctional();
    newColumnButtonPress();
    boardOpener();
    openedBoardHandler();
    newCardButtonPress();
    deleteButton();
    makeTitleEditable();
}


function openedBoardHandler()
{
    let cookies = document.cookie.split('; ');
    let openedBoards = [];
    for(let cookie of cookies)
    {
        cookie = cookie.split('=');
        if(cookie[1] === 'opened')
        {
            openedBoards.push(cookie[0]);
        }
    }
    let boards = document.getElementsByClassName('board');
    for(let board of boards)
    {
        if(openedBoards.includes(board.id))
        {
            openBoard(board);
        }
    }
}


function handleCardMoving(card, targetColumn, sourceColumn, siblingElement)
{
    changeBoardColumnIdOfCard(card, targetColumn);
    refreshPositionOfCards(sourceColumn);
    refreshPositionOfCards(targetColumn);
}


function changeBoardColumnIdOfCard(card, targetColumn)
{
    const newBoardColumnId = Number(targetColumn.parentElement.id);
    const cardId = Number(card.dataset.card_id);
    const url = '/update-card-column-id';
    const data = {newBoardColumnId: newBoardColumnId, cardId: cardId};
    fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((data) => {
        if(data.attempt === 'successful'){}
    });
}


function refreshPositionOfCards(column)
{
    let cards = column.children;
    if(cards.length === 0) return;

    let idsAndPositions = {};
    let position = 0;
    let url = '/update-card-positions';
    for(let card of cards)
    {
        position+=1;
        idsAndPositions[position] = Number(card.dataset.card_id);
    }

    fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(idsAndPositions)
    })
    .then((response) => response.json())
    .then((data) => {
        if(data.attempt === 'successful'){}
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function submitButton()
{
    let btn = document.getElementById('login-register-btn');
    btn.addEventListener('click', function () {
        let btn = document.getElementsByClassName('btn btn-outline-primary active');
        for (let l_or_r of btn) {
            let statusBtn = l_or_r.textContent.trim();
            let xhr = new XMLHttpRequest();
            xhr.open("POST", '/login_and_register', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (xhr.responseText === 'success') {
                        location.reload();
                    } else if (xhr.responseText === 'failed login') {
                        let alert = document.getElementById('alert-text');
                        alert.innerText = 'Invalid E-mail or Password!';
                    } else {
                        let alert = document.getElementById('alert-text');
                        alert.innerText = 'E-mail or Username already in use!';
                    }
                }
            };
            xhr.send(JSON.stringify({
                'status' : statusBtn,
                'email': document.getElementById('exampleInputEmail1').value,
                'password': document.getElementById('exampleInputPassword1').value,
                'username' : document.getElementById('exampleInputUsername1').value
            }));
            event.stopPropagation();
        }
    });
}


function registerButton()
{
    let btn = document.getElementsByClassName('btn-outline-primary')[1];
    btn.addEventListener('click', function () {
        let button = document.getElementById('login-register-btn');
        button.innerText = 'Register';
        let username = document.getElementById('exampleInputUsername1');
        username.style.display = 'block';
    });
}


function loginButton()
{
    let username = document.getElementById('exampleInputUsername1');
    username.style.display = 'none';
    let btn = document.getElementsByClassName('btn-outline-primary')[0];
    btn.addEventListener('click', function () {
        let button = document.getElementById('login-register-btn');
        button.innerText = 'Login';
        let username = document.getElementById('exampleInputUsername1');
        username.style.display = 'none';
    });
}


const createNewColumn = (columnName, boardId) => {
    const url = '/column';
    const userInput = {columnName: columnName, boardId: Number(boardId)};
    fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(userInput)
    })
    .then((response) => response.json())
    .then((data) => {
        if(data.attempt === 'successful') {
            reloadPageBoard();
        }
    });
};


// better name for this function
const newColumnButtonPress = () => {
    const btnList = document.getElementsByClassName('column');
    for (let btn of btnList) {
        const boardId = btn.id.replace('-column', '');
        const inputId = btn.id.replace('-column', '-input');
        btn.addEventListener('click', () => {
            newColumn(inputId, boardId);
        });
    }
};


const newColumn = (inputId, boardId) => {
    const inputValue = document.getElementById(inputId).value;
    if (inputValue !== '') {
        createNewColumn(inputValue, boardId);
    } else {
        alert('missing column name');
    }
};


function closeInput() {
    document.getElementById('new-board-input').hidden = true;
    document.getElementById('new-board-input').value = '';
    document.getElementById('add-board').disabled = false;
}


function makeTitleEditable() {
    const spans = document.getElementsByTagName('span');
    for (const span of spans) {
        if (span.contentEditable) {
            span.onblur = function () {
                if(span.innerText.length < 1)
                {
                    alert('Board name can\'t be empty');
                    span.innerText = span.dataset.original;
                    return
                }
                const url = '/edit_titles';
                const subject = {subject: 'board_title', title: span.innerText, id: span.getAttribute('data-id')};
                fetch(url, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                    body: JSON.stringify(subject)
                })
                .then((response) => response.json())
                .then((data) => {
                });
                 span.dataset.original = span.innerText;
            }
        }
    }
    const column_names = document.getElementsByTagName('h4');
    for (const column of column_names) {
        if (column.contentEditable) {
            column.onblur = function () {
                if(column.innerText.length < 1)
                {
                    alert('Column name can\'t be empty');
                    column.innerText = column.dataset.original;
                    return
                }
                const url = '/edit_titles';
                const subject = {subject: 'column_title', title: column.innerText, original: column.getAttribute('data-original'), id: column.getAttribute('data-boardid')};
                fetch(url, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                    body: JSON.stringify(subject)
                })
                .then((response) => response.json())
                .then((data) => {
                });
                column.dataset.original = column.innerText;
            }
        }
    }
}


const newCardButtonPress = () => {
    const btnList = document.getElementsByClassName('new-card');
    for (let btn of btnList) {
        btn.addEventListener('click', newCard);
    }
};


const newCard = (event) => {
    const inputValue = event.target.parentElement.firstChild.nextSibling.value;
    const boardColumnId = event.target.parentElement.parentElement.id;
    const position = event.target.parentElement.previousElementSibling.childElementCount+1;
    if (inputValue !== '') {
        createNewCard(inputValue, boardColumnId, position);
    } else {
        alert('missing card name');
    }
};


const createNewCard = (cardName, boardColumnId, position) => {
    const url = '/card';
    const userInput = {cardName: cardName, boardColumnId: Number(boardColumnId), position: position};
    fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(userInput)
    })
    .then((response) => response.json())
    .then((data) => {
        if(data.attempt === 'successful') {
            reloadPageBoard();
        }
    });
};


function deleteButton()
{
    const deleteButtons = document.getElementsByClassName('fa-times');
    for(let deleteButton of deleteButtons)
    {
        deleteButton.addEventListener('click', function(event)
        {
            const board = event.target;
            const url = '/delete';
            const subject = {subject: event.target.dataset.target, id: event.target.dataset.id};
            fetch(url,
                {
                method: 'POST',
                headers:
                    {
                    "Content-Type": "application/json; charset=utf-8",
                    },
                body: JSON.stringify(subject)
                })
                .then((response) => response.json())
                .then((response) => {
                    if(response.attempt === 'successful')
                    {
                        reloadPageBoard()
                    }
                });
        });
    }
}


init();