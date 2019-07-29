Vue.component('v-minusplus', {
    template: `
<div class="minusplusnumber">
    <div class="mpbtn minus" v-on:mousedown="mpminus()">&lt;</div>
    <div id="field_container">
        <input type="hidden" v-model="newValue" />
        <span>x</span><span id="value">{{ newValue }}</span>
    </div>
    <div class="mpbtn plus" v-on:mousedown="mpplus()">&gt;</div>
</div>
`,
    props: {
        value: {
            default: 0,
            type: Number
        },
        min: {
            default: 0,
            type: Number
        },
        max: {
            default: undefined,
            type: Number
        },
        interval: {
            default: 1,
            type: Number
        }

    },
    data: function () {
        return {
            newValue: 0,
            intervalTask: 0,
            overflow: 0,
            underflow: 0,
            taskOn: false
        }

    },
    methods: {
        mpplus: function () {
            this.plus();
            clearInterval(this.intervalTask);
            this.intervalTask = setInterval(function () {
                if (window.mp_mouseDown === false) {
                    this.stopChange();
                }
                else {
                    this.plus();
                }
            }.bind(this), 130);
        },
        mpminus: function () {
            this.minus();
            clearInterval(this.intervalTask);
            this.intervalTask = setInterval(function () {
                if (window.mp_mouseDown === false) {
                    this.stopChange();
                }
                else {
                    this.minus();
                }
            }.bind(this), 130);
        },
        plus: function () {
            if (this.max == undefined || (this.newValue < this.max)) {
                this.newValue = this.newValue + this.interval - this.underflow;
                if (this.newValue > this.max) {
                    this.overflow = this.newValue - this.max;
                    this.newValue = this.max;
                }
                this.underflow = 0;
                this.$emit('input', this.newValue);
            }
        },
        minus: function () {
            if ((this.newValue) > this.min) {
                this.newValue = this.newValue - this.interval + this.overflow;
                if (this.newValue < this.min) {
                    this.underflow = this.min - this.newValue;
                    this.newValue = this.min;
                }
                this.overflow = 0;
                this.$emit('input', this.newValue);
            }
        },
        stopChange: function () {
            clearInterval(this.intervalTask);
        }
    },
    watch: {
        value: {
            handler: function (newVal, oldVal) {
                this.newValue = newVal;
            }
        }
    },
    created: function () {
        this.newValue = this.value;
    }
});


document.addEventListener("mousedown", function() {
    window.mp_mouseDown = true;
});


document.addEventListener("mouseup", function() {
    window.mp_mouseDown = false;
});
