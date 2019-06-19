<?php

class Animation_model extends CI_Model {

	public function __construct() {
	}

	/**
	 * 指定された文書 ID とアニメーション ID の内容を取得します。
	 * 存在しないときは空文字列を返します。
	 */
	public function get_animation_content($doc_id, $animation_id) {

		$this->db->where('doc_id', $doc_id);
		$this->db->where('animation_id', $animation_id);
		$query = $this->db->get('t_doc_animation');

		if ($query->num_rows() > 0) {
			$animation = $query->row_array();
			$content = $animation['content'];
		}
		else {
			$content = '';
		}

		$query->free_result();
		return $content;
	}

	/**
	 * 指定された文書 ID とアニメーション ID の内容を保存します。
	 */
	public function set_animation_content($doc_id, $animation_id, $content) {
		$animation = array(
			'doc_id'		=> $doc_id,
			'animation_id'	=> $animation_id,
			'content'		=> $content,
		);
		$this->db->replace('t_doc_animation', $animation);
	}

	/**
	 * 指定された文書 ID とアニメーション ID の内容を物理削除します。
	 * 実際に削除された場合は TRUE、削除されなかった場合は FALSE を返します。
	 */
	public function delete_animation($doc_id, $animation_id) {
		$this->db->where('doc_id', $doc_id);
		$this->db->where('animation_id', $animation_id);
		$this->db->delete('t_doc_animation');
		return ($this->db->affected_rows() > 0);
	}

	/**
	 * 指定された文書 ID に関して、指定されたアニメーション ID リストに
	 * 含まれていない内容を物理削除します。
	 */
	public function delete_unused_animations($doc_id, $used_animation_id_list) {

		$this->db->where('doc_id', $doc_id);

		if ($used_animation_id_list) {
			$this->db->where_not_in('animation_id', $used_animation_id_list);
		}

		$this->db->delete('t_doc_animation');
	}

	/**
	 * 指定された文書のアニメーションを別の文書のアニメーションとしてコピーします。
	 */
	public function copy_all_animations($dst_doc_id, $src_doc_id) {
	
		// 指定された文書のアニメーションをすべて削除します。
		$this->db->where('doc_id', $dst_doc_id);
		$this->db->delete('t_doc_animation');
		
		// 指定された文書にアニメーションをコピーします。
		$sql = <<<EOD
INSERT INTO t_doc_animation (doc_id, animation_id, content)
SELECT ?, animation_id, content FROM t_doc_animation WHERE doc_id=?
EOD;
		
		$this->db->query($sql, array($dst_doc_id, $src_doc_id));
	}

}
