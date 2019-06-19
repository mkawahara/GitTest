<?php

define('CH_CONVERT_TYPE_EXPORT', 1);
define('CH_CONVERT_TYPE_IMPORT', 2);

class Convert_model extends CI_Model {

	public function __construct() {
		$this->load->model('file_model');
		$this->load->model('voice_model');
	}

	//////////////////////////////////////////////////////////////////////////////
	//// エクスポートのキャンセル

	/**
	 * 指定されたユーザー ID、文書 ID、変換タイプに関連付けられている
	 * 変換レコードを取得します。存在しないときは NULL を返します。
	 */
	public function get_convert_of_user_doc($user_id, $doc_id, $convert_type) {

		$this->db->where('user_id', $user_id);
		$this->db->where('doc_id', $doc_id);
		$this->db->where('convert_type', $convert_type);

		$query = $this->db->get('t_convert');
		$convert = ($query->num_rows() > 0) ? ($query->row_array()) : NULL;
		$query->free_result();

		return $convert;
	}

	/**
	 * タスク ID を指定して変換レコードを取得します。
	 */
	public function get_convert_of_task($task_id) {

		$this->db->where('task_id', $task_id);

		$query = $this->db->get('t_convert');
		$convert = ($query->num_rows() > 0) ? ($query->row_array()) : NULL;
		$query->free_result();

		return $convert;
	}

	/**
	 * 指定されたタスク ID の exportable_count をデクリメントします。
	 * デクリメント後の値を返します。
	 * デクリメント後の値が負数になる場合は、ゼロを返します。
	 * 変換レコードが存在しない場合も、ゼロを返します。
	 */
	public function decrement_exportable_count($task_id) {

		// デクリメントします。
		$this->db->where('task_id', $task_id);
		$this->db->where('exportable_count>', 0);
		$this->db->set('exportable_count', 'exportable_count - 1', FALSE);
		$this->db->update('t_convert');

		// 変換レコードを取得します。
		$convert = $this->get_convert_of_task($task_id);

		// 変換レコードの exportable_count 値を返します。
		// ただし、負数の場合は 0 を返します。
		if ($convert) {
			$count = $convert['exportable_count'];
			if ($count < 0) $count = 0;
			return $count;
		}
		else {
			return 0;
		}
	}

	/**
	 * 指定されたタスク ID の変換レコードを更新します。
	 */
	public function update_convert_of_task($task_id, $record) {
		$this->db->where('task_id', $task_id);
		$this->db->update('t_convert', $record);
	}

	/**
	 * 指定されたタスク ID の変換レコードを削除します。
	 */
	public function delete_convert_of_task($task_id) {
		$this->db->where('task_id', $task_id);
		$this->db->delete('t_convert');
	}

	/**
	 * 変換テーブルにレコードを作成します。
	 * タスク ID を生成して登録し、戻り値として返します。
	 */
	public function insert_convert($user_id, $doc_id, $convert_type, $file_type) {

		// タスク ID を生成します。
		$task_id = ch_task_id_create($user_id);

		// レコードを挿入します。
		$convert = array(
			'task_id'		=> $task_id,
			'user_id'		=> $user_id,
			'doc_id'		=> $doc_id,
			'convert_type'	=> $convert_type,
			'file_type'		=> $file_type,
			'queued_at'		=> ch_current_time_string(),
		);
		$this->db->insert('t_convert', $convert);

		return $task_id;
	}

	/**
	 * 指定されたユーザーのエクスポート数を取得します。
	 */
	public function get_export_count_of_user($user_id) {
		$this->db->where('user_id', $user_id);
		$this->db->where('convert_type', CH_CONVERT_TYPE_EXPORT);
		$query = $this->db->get('t_convert');
		$convert = ($query->num_rows() > 0) ? ($query->row_array()) : NULL;

		// 変換レコードの exportable_count 値を返します。
		if ($convert) {
			$count = (int) $convert['exportable_count'];
			if ($count < 0) $count = 0;
			return $count;
		}
		else {
			return 0;
		}
	}
}
