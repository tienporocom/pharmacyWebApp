const DrugGroup = require("../models/drugGroup");

// Lấy danh sách nhóm thuốc
exports.getDrugGroups = async (req, res) => {
    try {
        const groups = await DrugGroup.find();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy chi tiết nhóm thuốc
exports.getDrugGroup = async (req, res) => {
    try {
        const group = await DrugGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: "Drug group not found" });

        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Thêm nhóm thuốc mới
exports.createDrugGroup = async (req, res) => {
    try {
        const group = new DrugGroup(req.body);
        await group.save();

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cập nhật nhóm thuốc

exports.updateDrugGroup = async (req, res) => {
    try {
        const group = await DrugGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: "Drug group not found" });

        Object.assign(group, req.body);
        await group.save();

        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Xóa nhóm thuốc
exports.deleteDrugGroup = async (req, res) => {
    try {
        const group = await DrugGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: "Drug group not found" });

        await group.remove();
        res.json({ message: "Drug group deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

