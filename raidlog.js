
var Encounters = new Mongo.Collection("encounters");
if (Meteor.isClient) {
  Template.registerHelper("formatDPS", function(dps) {
    return Math.floor(dps);
  });
  Template.encounters.helpers({
    encounters: function() {
      return Encounters.find();
    },
    encounterSettings: function() {
      return {
        fields: [ { key:'date', label: 'Date'}, {key:'name', label: 'Name', tmpl: Template.nameTemp}, {key:'raiddps', label:'Raid DPS', tmpl: Template.raiddpsTemp }, {key:'duration', label: 'Duration'}],
        showNavigation: 'auto',
        rowsPerPage: 25
      }
    }
  });
  Template.encounters.events({
    'click ._name': function(event) {
        event.preventDefault();
        Session.set("encounterId", this._id);
        $("#_encounter").removeClass('hide');
        buildChart();
    }
  });
  Template.encounterDetails.helpers({
    encounters: function() {
      return Encounters.find({_id: Session.get("encounterId")});
    },
    damageType: function() {
      var data = Encounters.findOne({_id: Session.get("encounterId")}),
        chr;
      if (!data)
        return;

      data.allies.forEach(function(d) {
        if (d.Name == Session.get("charId"))
          chr = d;
      });
      return { name: chr.Name, damageTypes: chr.damageTypes };
    },
    breakDown: function() {
      var data = Encounters.findOne({_id: Session.get("encounterId")}),
        chr,
        breakdown;
      if (!data)
        return;
      data.allies.forEach(function(d) {
        if (d.Name == Session.get("charId"))
          chr = d;
      });
      chr.damageTypes.forEach(function(dt) {
        if (dt.name == Session.get('breakDownId'))
          breakdown = {name: dt.name, breakdown: dt.breakdown }
      })
      return breakdown
    },
    breakDownSettings: function() {
      return {
        fields: [{key: 'Type', label: 'Name'}, {key:'EncDPS', label: 'DPS', tmpl: Template.EncDPSTemp, sort: 'descending'}, 'Average', 'Median', 'MinHit', 'MaxHit', 'Hits', 'CritHits', {key: 'ToHit', label: 'Accuracy'}],
        showFilter: false,
        showNavigation: 'auto',
        rowsPerPage: 15
      }
    },
    damageTypeSettings: function() {
      return {
        fields: [{key:'name', label:"Type", tmpl: Template.damageTypeTemp},{key:'EncDPS', label: 'DPS', tmpl: Template.EncDPSTemp, sort: 'descending'}, 'Average', 'MinHit', 'MaxHit', 'CritHits', 'Blocked', 'Misses', 'AverageDelay', 'CritPerc'],
        showFilter: false,
        showNavigation: 'auto',
        rowsPerPage: 9
      };
    },
    allySettings: function() {
      return {
        fields: [{key:'Name', label: 'Name', tmpl: Template.playNameTemp}, 'Job', {key:'EncDPS', label: 'DPS', tmpl: Template.EncDPSTemp, sort: 'descending'}, {key:'EncHPS', label:'HPS', tmpl: Template.EncHPSTemp}, {key:'ToHit', label:'Accuracy'},'DamageTaken', 'Deaths', 'OverHealPct'],
        showFilter: false,
        showNavigation: 'auto',
        rowsPerPage: 9
      }
    }
  });
  Template.encounterDetails.events({
    'click ._name': function(event) {
      event.preventDefault();
      Session.set("charId", this.Name);
    },
    'click ._type': function(event) {
      event.preventDefault();
      Session.set("breakDownId", this.name);
    }
  });
  function buildChart() {
    var data = Encounters.findOne({_id: Session.get("encounterId")});
    if (!data)
      return;
    var seriesData = [];
    data.allies.forEach(function(ally) {
      seriesData.push([ally.Name, Number(ally.DamagePerc.replace(/%/g,""))]);
    });
    $('#theChart').highcharts({
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
          },
          title: {
            text: 'Total Damage'
          },
          series: [{
                type: 'pie',
                name: 'Damage%',
                data: seriesData
            }]
      });
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
