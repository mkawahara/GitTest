/**
 * Undo, Redo を統括するクラスです。
 * コマンドの実行を担当し、そのスタックを保持します。
 */
var CommandExecutor = function(maxMemCost) {
	// Undo, Redoコマンドスタックを用意します。
	this.undoStack = new Stack(maxMemCost);
	this.redoStack = new Stack(maxMemCost);
	// UIを更新します。
	//this.updateUI();	// 初期化時のUI更新は不要です。（データ編集を伴わないため。）
};

CommandExecutor.prototype = {
		/**
		 * コマンド実行用メソッドです。
		 * @param command 実行コマンド
		 */
		execute : function(command) {
			// コマンドを実行します。
			if (command.execute()) {
				// コマンド成功時、Redoスタックをクリアします。
				this.redoStack.clear();
				// Undoスタックへコマンドを登録します。
				this.undoStack.push(command);
				// UIを更新します。
				this.updateUI();
			}
		},

		/**
		 * Undo実行用メソッドです。
		 */
		undo : function() {
			// Undoスタックが空でない場合のみ処理を実行します。
			if (!this.undoStack.isEmpty()) {
				// Undoスタックからコマンドを取得します。
				var command = this.undoStack.pop();
				// Undoを実行します。
				command.undo();
				// Redoスタックへ登録します。
				this.redoStack.push(command);
				// UIを更新します。
				this.updateUI();
			}
		},

		/**
		 * Redo実行用メソッドです。
		 */
		redo : function() {
			// Redoスタックが空でない場合のみ処理を実行します。
			if (!this.redoStack.isEmpty()) {
				// Redoスタックからコマンドを取得します。
				var command = this.redoStack.pop();
				// Redoを実行します。
				command.redo();
				// Undoスタックへ登録します。
				this.undoStack.push(command);
				// UIを更新します。
				this.updateUI();
			}
		},

		/**
		 * UI更新用メソッドです。
		 */
		updateUI : function() {
			// Undoボタンの有効・無効を切り替えます。
			var sm = ViewManager.getStatusManager();
			//TODO enableUndoButton(!this.undoStack.isEmpty());
			var undoVal = !this.undoStack.isEmpty();
			sm.setUndoAttribute(undoVal);
			// Redoボタンの有効・無効を切り替えます。
			//TODO enableRedoButton(!this.redoStack.isEmpty());
			var redoVal = !this.redoStack.isEmpty();
			sm.setRedoAttribute(redoVal);
			// 文書が変更されたことをステータスマネージャへ通知します。
			sm.setSaveAttribute(true);
		},

		/**
		 * undo/redo スタックをクリアします。
		 */
		clear : function() {
			this.undoStack.clear();
			this.redoStack.clear();
	},
};