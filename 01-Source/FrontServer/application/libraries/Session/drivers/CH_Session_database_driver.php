<?php defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * セッション ID が再生成されるタイミングで t_file テーブルの
 * edit_session_id カラムの値を新しいセッション ID に更新します。
 */
class CH_Session_database_driver extends CI_Session_database_driver {

	public function write($session_id, $session_data)
	{
		// セッション ID が再生成された場合
		if ($session_id !== $this->_session_id)
		{
			$this->_db->where('edit_session_id', $this->_session_id);
			$this->_db->set('edit_session_id', $session_id);
			$this->_db->update('t_file');
		}
	
		// 基底クラスの write メソッドを呼び出します。
        return parent::write($session_id, $session_data);
	}
}
