/**
 * コマンド用基底クラスです。
 */
var BaseCommand = function() {};

BaseCommand.prototype = {

		/**
		 * コマンド実行時にコールされるメソッドです。
		 */
		execute : function() {
			throw new UndoRedoUndefinedError('execute()関数が未定義です。in BaseCommand.js line 12');
		},

		/**
		 * Undo実行時にコールされるメソッドです。
		 */
		undo : function() {
			throw new UndoRedoUndefinedError('undo()関数が未定義です。in BaseCommand.js line 19');
		},

		/**
		 * Redo実行時にコールされるメソッドです。
		 * デフォルトではexecute()を実行します。
		 */
		redo : function() {
			throw new UndoRedoUndefinedError('redo()関数が未定義です。in BaseCommand.js line 27');
		},

		/**
		 * オブジェクトのメモリコストを返すメソッドです。
		 */
		getMemCost : function() {
			throw new UndoRedoUndefinedError('getMemCost()関数が未定義です。in BaseCommand.js line 34');
		}
};

/**
 * Undo, Redoの未定義例外オブジェクトです。
 * @param message 例外エラーメッセージ
 */
var UndoRedoUndefinedError = function(message) {
    this.name = 'UndoRedoUndefined';
    this.message = message || 'UndoRedoが未定義です。in BaseCommand.js line 44';
};

UndoRedoUndefinedError.prototype = new Error();
UndoRedoUndefinedError.prototype.constructor = UndoRedoUndefinedError;