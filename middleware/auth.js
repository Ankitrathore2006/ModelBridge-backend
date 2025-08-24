const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

const requireAuth = ClerkExpressWithAuth({
  onError: (err, req, res) => {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
});

module.exports = requireAuth;
