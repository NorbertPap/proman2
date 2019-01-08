from flask import Flask, render_template, session, redirect, url_for, request
from functools import wraps
from werkzeug.security import generate_password_hash
import data_manager
import json

app = Flask(__name__)
app.secret_key = '\xfd{H\xe5<\x95\xf9\xe3\x96.5\xd1\x01O<!\xd5\xa2\xa0\x9fR"\xa1\xa8'


def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('login'))
    return wrap


@app.route("/logout")
@login_required
def logout():
    session.clear()
    return redirect(url_for('boards'))


@app.route('/board', methods=['POST'])
def register_new_board():
    new_board_name = request.json.get('boardName')
    new_board_type = request.json.get('boardType')
    user_id = session.get('user_id')
    data_manager.register_new_board(new_board_name, new_board_type, user_id)
    return json.dumps({'attempt': 'successful'})


@app.route('/column', methods=['POST'])
def add_new_column():
    column_name = request.json.get('columnName')
    board_id = request.json.get('boardId')
    data_manager.add_new_column(column_name, board_id)
    return json.dumps({'attempt': 'successful'})


@app.route('/card', methods=['POST'])
def add_new_card():
    card_name = request.json.get('cardName')
    board_column_id = request.json.get('boardColumnId')
    position = request.json.get('position')
    data_manager.add_new_card(card_name, board_column_id, position)
    return json.dumps({'attempt': 'successful'})


@app.route("/")
def boards():
    ''' this is a one-pager which shows all the boards and cards '''
    if 'logged_in' in session:
        status = f'Logged in as {session["username"]}'
    else:
        status = 'Not logged in'
    board_tree = data_manager.get_board_tree(session.get('user_id'))
    return render_template('boards.html', status=status, board_tree=board_tree)


@app.route('/login_and_register', methods=['POST'])
def login_and_register():
    data = request.get_json(force=True)
    if data['status'] == 'Login':
        check_user = data_manager.user_login(data['email'], data['password'])
        if check_user[0] is True:
            session['logged_in'] = True
            session['username'] = check_user[2]
            session['user_id'] = check_user[1]
            return 'success'
        elif check_user[0] is False:
            return 'failed login'
    else:
        password = generate_password_hash(data['password'])
        check_user = data_manager.register_new_user(data['username'], password, data['email'])
        if check_user is True:
            check_user = data_manager.user_login(data['email'], data['password'])
            print(check_user)
            session['logged_in'] = True
            session['username'] = check_user[2]
            session['user_id'] = check_user[1]
            return 'success'
        elif check_user is False:
            return 'failed registration'


def main():
    app.run(debug=True)


if __name__ == '__main__':
    main()
