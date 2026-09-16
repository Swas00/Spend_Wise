const express = require("express");
const SplitBill = require("../models/SplitBill");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// @route   GET /api/splits
// @desc    Get all split bills with calculated net receivables
router.get("/", async (req, res) => {
  try {
    const bills = await SplitBill.find({ user: req.user._id }).sort({ date: -1 });

    let totalOwedToMe = 0;
    let totalSettled = 0;

    bills.forEach((bill) => {
      if (bill.paidByMe) {
        bill.participants.forEach((p) => {
          if (!p.settled) {
            totalOwedToMe += Number(p.share) || 0;
          } else {
            totalSettled += Number(p.share) || 0;
          }
        });
      }
    });

    res.json({
      bills,
      totalOwedToMe,
      totalSettled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/splits
// @desc    Record a new split bill with roommates/friends
router.post("/", async (req, res) => {
  try {
    const { title, totalAmount, paidByMe, myShare, participants, date, notes } = req.body;

    if (!title || !totalAmount || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        message: "Title, total bill amount, and at least one participant are required"
      });
    }

    const splitBill = new SplitBill({
      user: req.user._id,
      title: title.trim(),
      totalAmount: Number(totalAmount),
      paidByMe: paidByMe !== false,
      myShare: Number(myShare) || 0,
      participants: participants.map((p) => ({
        name: p.name.trim(),
        share: Number(p.share) || 0,
        settled: !!p.settled,
        settledAt: p.settled ? new Date() : null
      })),
      date: date || new Date(),
      notes: notes ? notes.trim() : ""
    });

    const saved = await splitBill.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PATCH /api/splits/:id/settle/:participantIndex
// @desc    Toggle settlement status for a specific participant
router.patch("/:id/settle/:participantIndex", async (req, res) => {
  try {
    const bill = await SplitBill.findOne({ _id: req.params.id, user: req.user._id });
    if (!bill) {
      return res.status(404).json({ message: "Split bill not found" });
    }

    const idx = parseInt(req.params.participantIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= bill.participants.length) {
      return res.status(400).json({ message: "Invalid participant index" });
    }

    const participant = bill.participants[idx];
    participant.settled = !participant.settled;
    participant.settledAt = participant.settled ? new Date() : null;

    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/splits/:id
// @desc    Delete split bill
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SplitBill.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ message: "Split bill not found or unauthorized" });
    }

    res.json({ message: "Split bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
