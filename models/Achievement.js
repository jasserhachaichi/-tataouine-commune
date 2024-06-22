const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  titrec1: { type: String  },
  valc1: { type: Number  },
  titrec2: { type: String  },
  valc2: { type: Number  },
  titrec3: { type: String  },
  valc3: { type: Number  },
  titrec4: { type: String  },
  valc4: { type: Number  },
  path: {
    type: String
  } // to store image path
});

module.exports = mongoose.model('Achievement', achievementSchema);
