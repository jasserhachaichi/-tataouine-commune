const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
    titleForm: {
        type: String,required: true
    }, attributes: [{
        type: { type: String, default: null },
        subtype: { type: String, default: null },
        label: { type: String, default: null },
        required: { type: Boolean, default: null },
        description: { type: String, default: null },
        placeholder: { type: String, default: null },
        className: { type: String, default: null },
        name: { type: String, default: null },
        value: { type: String, default: null },
        maxlength: { type: Number, default: null },
        rows: { type: Number, default: null },
        min: { type: Number, default: null },
        max: { type: Number, default: null },
        step: { type: Number, default: null },
        multiple: { type: Boolean, default: null },
        values: [{
            label: { type: String, default: null },
            value: { type: String, default: null },
            selected: { type: Boolean, default: null }
        }],
        toggle: { type: Boolean, default: null },
        inline: { type: Boolean, default: null },
        other: { type: Boolean, default: null },
        requireValidOption: { type: Boolean, default: null },
        style: { type: String, default: null },
        access: { type: Boolean, default: null }
    }],
    FolderID:{ type: String },
    SHEETID: { type: String, required: true },
},{
    timestamps: true
});

const FormData = mongoose.model('formData', formDataSchema);

module.exports = FormData; 