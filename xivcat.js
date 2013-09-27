$(document).ready(function(){
  Cat.init();
});

Cat = {
  conf: {
    endpoint: "http://frontier.ffxiv.com/worldStatus/current_status.json",
    server: "Leviathan",
    pollInterval: 3000,
    blinkInterval: 1000
  },

  cache: {
    $body: null,
    $status: null,
    $errors: null,
    status: null
  },

  init: function() {
    // cache
    this.conf.$body = $("body");
    this.conf.$status = $("#status");
    this.conf.$errors = $("#errors");

    // update ui
    $("#server-name").text( this.conf.server );

    // go
    this.pollStatus();
  },

  pollStatus: function() {
    $.ajax({
      dataType: "text",
      url: this.conf.endpoint
    }).done( this.responseGet );
  },

  responseGet: function( response ) {
    // Response format is {"Atomos":1,"Bahamut":3, ..}
    // 1 is UP, 3 is DOWN
    var updateStatusResult = null;
    var lodestoneList = $.parseJSON( response );
    for( var server in lodestoneList ) {
      if (server === this.conf.server) {
        updateStatusResult = this.updateStatus( lodestoneList[server] );
        break;
      }
    }

    switch (updateStatusResult) {
      case "Came Up":
        // go crazy then stop execution
        this.blink();
        return;
      case "Went Down":
        this.errorMsg( "server went down" );
        break;
      case "???":
        this.errorMsg( "unknown response from lodestone" );
        break;
      default:
        this.errorMsg( "unknown updateStatusResult" );
    }

    window.setTimeout( this.pollStatus, this.conf.pollInterval );
  },

  updateStatus: function( newStatus ) {
    var oldStatus = this.cache.status;
    this.cache.status = newStatus;

    switch ( newStatus ) {
      case 1:
        this.updateDomStatus( "DOWN" );
        break;
      case 3:
        this.updateDomStatus( "UP" );
        break;
      default:
        this.updateDomStatus( "???" );
    }

    if( oldStatus === null ) {
      return "Init";
    } else if( newStatus !== oldStatus ) {
      switch ( newStatus ) {
        case 1:
          return "Went Down";
          break;
        case 3:
          return "Came Up";
          break;
        default:
          return "???";
      }
    } else {
      return "???";
    }
  },

  updateDomStatus: function( status ) {
    this.cache.$status.text( status );
  },

  blink: function() {
    this.cache.$body.css({ "background": "black", "color": "white" });
    window.setTimeout( this.unblink, this.conf.blinkInterval );
  },

  unblink: function() {
    this.cache.$body.css({ "background": "white", "color": "black" });
    window.setTimeout( this.blink, this.conf.blinkInterval );
  },

  errorMsg: function( msg ) {
    this.cache.$errors.text( msg );
  }
};