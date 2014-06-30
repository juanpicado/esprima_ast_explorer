/**
 * @jsx React.DOM
 */
"use strict";

var ArrayElements = require('./ArrayElements');
var PropertyList = require('./PropertyList');
var ArrayFormatter = require('./ArrayFormatter');
var ObjectFormatter = require('./ObjectFormatter');
var TokenName = require('./TokenName');

function isArray(v) {
  return Object.prototype.toString.call(v) === '[object Array]';
}

var Element = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    value: React.PropTypes.any
  },

  getInitialState: function() {
    // Some elements should be open by default
    var open = this.props.name === 'body' || this.props.open;
    return {
      open: open
    };
  },

  _toggleClick: function() {
    this.setState({open: !this.state.open});
  },

  _onMouseOver: function(e) {
    var loc = this.props.value.loc;
    global.cmHighlight(
      {line: loc.start.line - 1, ch: loc.start.column},
      {line: loc.end.line - 1, ch: loc.end.column}
    );
    e.stopPropagation();
  },

  _onMouseOut: function(e) {
    if (this.getDOMNode().contains(e.target)) return;
    global.cmClearHighlight();
    e.stopPropagation();
  },

  render: function() {
    /* jshint ignore:start */
    var value = this.props.value;
    var value_output = null;
    var content = null;
    var prefix = null;
    var suffix = null;
    var toggler = null;
    var showToggler = true;
    var isType = this.props.value && this.props.value.type;
    var enableHighlight = isType && this.props.value.type !== 'Program';

    if (isArray(value)) {
      content = <ArrayElements array={value} />;
      if (value.length > 0 && this.state.open) {
        prefix = "[";
        suffix = "]";
      } else {
        value_output = <ArrayFormatter array={value} />;
        showToggler = value.length > 0;
      }
    }
    else if (value && typeof value === "object") {
      var valueIsType = !!value.type;
      content = <PropertyList object={value} />;
      if (this.state.open) {
        if (value.type) {
          value_output =
            <TokenName
              onClick={this._toggleClick}
              object={value}
            />;
        }
        prefix = ' {';
        suffix = '}';
      }
      else {
        value_output =
          <ObjectFormatter
            onClick={this._toggleClick}
            object={value}
          />;
      }
    }
    else {
      value_output = <span className="s">{JSON.stringify(value)}</span>;
      showToggler = false;
    }
    if (showToggler) {
      toggler =
        <a href="#"
          className={"toggler" + (this.state.open ? " open" : '')}
          onClick={this._toggleClick}>
          {this.state.open ? '-' : '+'}
        </a>;
    }

    var name = this.props.name ? [
      <span className="name nb">{this.props.name}</span>,
      <span className="p">: </span>
    ] :
    null;

    return (
      <div
        className="entry"
        onMouseOver={enableHighlight ? this._onMouseOver : null}
        onMouseOut={enableHighlight ? this._onMouseOut : null}
      >
        <div>
          {toggler}
          <span
            className="key"
            onClick={showToggler ? this._toggleClick : null}>
            {name}
          </span>
          <span className="value">{value_output}</span>
          {prefix ? <span className="prefix p">{prefix}</span> : null}
        </div>
        <div className="value-body" style={{display: this.state.open ? 'block' : 'none'}}>{content}</div>
        {suffix ? <div className="suffix p">{suffix}</div> : null}
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = Element;