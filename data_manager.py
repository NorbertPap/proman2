import connection
from werkzeug.security import check_password_hash
import psycopg2


@connection.connection_handler
def register_new_user(cursor, username, password, email):
    try:
        cursor.execute("""
                        SELECT * FROM users
                        WHERE email = %(email)s OR user_name = %(username)s;
                        """, {'email': email, 'username': username})
        user = cursor.fetchall()
        if user != []:
            return False
        else:
            cursor.execute("""INSERT INTO users (user_name, hashed_pw, email)
                              VALUES (%(name)s, %(pw)s, %(email)s);""",
                           {'name': username, 'pw': password, 'email': email})
            return True
    except psycopg2.IntegrityError:
        return False


@connection.connection_handler
def user_login(cursor, email, password):
    cursor.execute("""
                    SELECT * FROM users
                    WHERE email = %(email)s;
                    """, {'email': email})
    user = cursor.fetchone()
    if user is not None:
        return check_password_hash(user.get('hashed_pw'), password), user.get('id'), user.get('user_name')
    return [False]


@connection.connection_handler
def get_board_tree(cursor, user_id):
    cursor.execute("""SELECT * FROM boards
                      WHERE private = 0 OR user_id = %(user_id)s
                      ORDER by private DESC""", {'user_id': user_id})
    boards = cursor.fetchall()
    for board in boards:
        cursor.execute("""SELECT * FROM board_columns
                          WHERE board_id = %(board_id)s""", {'board_id': board.get('id')})
        board['columns'] = cursor.fetchall()
        for board_column in board['columns']:
            cursor.execute("""SELECT * FROM cards
                              WHERE board_column_id = %(board_column_id)s
                              ORDER BY position ASC""", {'board_column_id': board_column.get('id')})
            board_column['cards'] = cursor.fetchall()
    return boards


@connection.connection_handler
def register_new_board(cursor, board_name, board_type, user_id):
    if board_type == 'private':
        board_type = 1
    else:
        board_type = 0
    cursor.execute("""INSERT INTO boards (title, private, user_id)
                      VALUES (%(board_name)s, %(board_type)s, %(user_id)s)""",
                   {'board_name': board_name,
                    'board_type': board_type,
                    'user_id': user_id})


@connection.connection_handler
def add_new_column(cursor, column_name, board_id):
    cursor.execute("""INSERT INTO board_columns (column_name, board_id)
                      VALUES (%(column_name)s, %(board_id)s)""", {'column_name': column_name, 'board_id': board_id})


@connection.connection_handler
def edit_title(cursor, type, title, board_id, original):
    if type == 'board_title':
        cursor.execute("""UPDATE boards SET title = %(title)s WHERE id = %(board_id)s""", {'title': title, 'board_id': board_id})
    else:
        cursor.execute("""UPDATE board_columns SET column_name = %(title)s 
        WHERE board_id = %(board_id)s AND column_name = %(original)s""",
                       {'title': title, 'board_id': board_id, 'original': original})
