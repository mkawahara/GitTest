
�쐬�ҁF(��)�m�\���V�X�e��
�X�V���F2015�N7��24��

���f�B���N�g���\��

application		CodeIgniter 3.x �� application �t�H���_�ł��B
system			CodeIgniter 3.x �� system �t�H���_�ł��B
www				�E�F�u���[�g�ł��BApache ����A�v���P�[�V���� ���[�g�Ƃ��ĎQ�Ƃ��܂��B

bin				Imlx �R���o�[�^���i�[���Ă��܂��B
db				�f�[�^�x�[�X�֌W�̃X�N���v�g���i�[���Ă��܂��B
doc				�݌v�h�L�������g���i�[���Ă��܂��B
ext				�O�����C�u�������i�[���Ă��܂��B

log				���O�o�̓t�H���_�ł��B
task			�^�X�N�̈ꎞ�t�@�C�����L�^����܂��B

���f�[�^�x�[�X�̃Z�b�g�A�b�v
1. db/db-create.sql �ɂ���ăf�[�^�x�[�X���쐬���܂��B
   �f�[�^�x�[�X���A���[�U�[���A�p�X���[�h�͓K�X�ύX���Ă��������B
2. db/db-schema.sql �ɂ���ăX�L�[�}���쐬���܂��B
3. application/database.php �� $db['default'] ��ҏW���A
   �f�[�^�x�[�X���B���[�U�[���A�p�X���[�h�A�|�[�g�ԍ��Ȃǂ�K�X�ύX���Ă��������B

��URL �}�b�s���O�̐ݒ�
Web �T�[�o�[�ɂ�� URL �Ƃ̑Ή��t���ɉ����āA
www/.htaccess ��ҏW����K�v������܂��B

���Ƃ��΁AApache �Ŏ��̂悤�ɃG�C���A�X�������Ă���ꍇ�A

    Alias /Editor/ "D:/home/ChattyInftyOnlineServer/www/"
    <Directory "D:/home/ChattyInftyOnlineServer/www/" >
        Options FollowSymLinks
        AllowOverride All
        Order allow,deny
        Allow from all
    </Directory>

 www/.htaccess �� RewriteBase �f�B���N�e�B�u�����̂悤�ɕҏW���Ă��������B

    RewriteBase /Editor/

