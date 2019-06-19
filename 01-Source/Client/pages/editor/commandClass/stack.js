/**
 *  Undo, Redo用のStackクラスです。
 *  格納されるデータの最大のメモリコストを設定します。
 */
var Stack = function(maxMemCost) {
	this.maxMemCost = maxMemCost;
	this.memCost = 0;
	this.data = new Array();
};

Stack.prototype = {
		/**
		 * Stack末尾へオブジェクトを追加します。
		 * 最大コストを超えるデータが登録された場合、Stack先頭のデータから削除します。
		 * @param o 追加されるデータ
		 */
		push : function(o) {
			// データを末尾へ追加します。
			this.data.push(o);
			this.memCost += o.getMemCost();
			// データの最大長が設定されており、データ数が最大長を超えたとき、
			// Stack先頭のデータを削除します。
			while (this.maxMemCost > 0 && this.memCost > this.maxMemCost) {
				var removed = this.data.shift();
				this.memCost -= removed.getMemCost();
			}
		},

		/**
		 * Stack末尾からデータを削除し、格納されていたデータを取り出します。
		 * @returns 末尾に格納されていたデータ
		 */
		pop : function() {
			if (this.data.length === 0) {
				// データ未登録のときエラーを発生します。
				throw new RangeError('Stackデータが未登録です。in Stack.js line 36');
			}
			var removed = this.data.pop();
			this.memCost -= removed.getMemCost();
			return removed;
		},

		/**
		 * Stackのデータ数を取得します。
		 * @returns Stackのデータ数
		 */
		getLength : function() {
			return this.data.length;
		},

		/**
		 * Stackの現在のメモリコストを取得します。
		 * @returns Stackの現在のメモリコスト
		 */
		getMemCost : function() {
			return this.memCost;
		},

		/**
		 * Stackに格納されるメモリコストの上限を取得します。
		 * @returns メモリコストの上限
		 */
		getMaxMemCost : function() {
			return this.maxMemCost;
		},

		/**
		 * Stackの要素をクリアします。
		 */
		clear : function() {
			this.memCost = 0;
			this.data = [];
		},

		/**
		 * Stackの要素が空かどうかを確認します。
		 */
		isEmpty : function() {
			return (this.data.length === 0);
		},

		/**
		 * Stackの内容を連結した文字列を返します。
		 */
		toString : function() {
			return '[' + this.data.join(', ') + ']';
		}
};
