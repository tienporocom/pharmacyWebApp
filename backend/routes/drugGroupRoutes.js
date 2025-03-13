const express = require('express');
const router = express.Router();
const { getDrugGroups, getDrugGroup, createDrugGroup, updateDrugGroup, deleteDrugGroup } = require('../controllers/drugGroupController');

router.get('/', getDrugGroups);          // Lấy danh sách nhóm thuốc
router.get('/:id', getDrugGroup);        // Lấy chi tiết nhóm thuốc
router.post('/', createDrugGroup);       // Thêm nhóm thuốc mới
router.put('/:id', updateDrugGroup);     // Cập nhật nhóm thuốc
router.delete('/:id', deleteDrugGroup);  // Xóa nhóm thuốc

module.exports = router;
