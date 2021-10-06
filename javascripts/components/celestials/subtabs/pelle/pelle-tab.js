"use strict";

Vue.component("pelle-tab", {
  data() {
    return {
      isDoomed: false,
      armageddonInterval: 0,
      currentArmageddonDuration: 0,
      unstableMatter: new Decimal(0),
      hasFamine: false,
      hasPestilence: false,
      hasChaos: false,
      unstableMatterGain: 0,
      unstableMatterPerMinute: 0,
      showBoughtUpgrades: false,
      unboughtUpgrades: [],
      boughtUpgrades: []
    };
  },
  methods: {
    update() {
      this.isDoomed = Pelle.isDoomed;
      this.armageddonInterval = Pelle.armageddonInterval;
      this.currentArmageddonDuration = Pelle.currentArmageddonDuration;
      this.unstableMatter.copyFrom(player.celestials.pelle.unstableMatter);
      this.hasFamine = Pelle.famine.unlocked;
      this.hasPestilence = Pelle.pestilence.unlocked;
      this.hasChaos = Pelle.chaos.unlocked;
      this.unstableMatterGain = Pelle.unstableMatterGain;
      this.unstableMatterPerMinute = Pelle.unstableMatterGain / 
        TimeSpan.fromMilliseconds(Pelle.armageddonInterval).totalMinutes;
      this.unboughtUpgrades = PelleUpgrade.all.filter(upg => !upg.isBought).slice(0, 12);
      this.boughtUpgrades = PelleUpgrade.all.filter(upg => upg.isBought);
    },
    getDoomed() {
      player.celestials.pelle.doomed = true;
      Pelle.armageddon(false);
      Glyphs.unequipAll();
      respecTimeStudies(true);
      disChargeAll();
    },
    upgradeClass(upg) {
      return {
        [`pelle-upgrade-${upg.config.currency}`]: true,
        "pelle-upgrade--canbuy": upg.canBeBought,
        "pelle-upgrade--isbought": upg.isBought
      };
    }
  },
  computed: {
    visibleUpgrades() {
      if (!this.showBoughtUpgrades) return this.unboughtUpgrades.slice(0, 9);
      
      return this.boughtUpgrades.concat(this.unboughtUpgrades.slice(0, 9));
    },
    transparentUpgrades() {
      return this.unboughtUpgrades.slice(9, 12);
    },
    pelleRebuyable() {
      return {
        permanentTickspeed: PelleRebuyableUpgrade.permanentTickspeed,
        permanentGalaxies: PelleRebuyableUpgrade.permanentGalaxies,
        permanentDimensionBoosts: PelleRebuyableUpgrade.permanentDimensionBoosts,
      };
    }
  },
  template:
    `<div class="l-pelle-celestial-tab">
      <button @click="getDoomed()">Doom your reality lol</button>
      <p>Armageddon has lasted {{ format(currentArmageddonDuration / 1000, 2, 2) }}/{{ format(armageddonInterval / 1000, 2, 2) }} seconds</p>
      <p>
        You have <b>{{ format(unstableMatter, 2, 2) }}</b>
        Unstable matter, you will gain {{ format(unstableMatterGain, 2, 2) }} 
        on next Armageddon ({{ format(unstableMatterPerMinute, 2, 2)}} / min).
      </p>
      <div class="c-pelle-currency-container">
        <pelle-currency currency="famine" :rebuyable="pelleRebuyable.permanentTickspeed" v-show="hasFamine"/>
        <pelle-currency currency="pestilence" :rebuyable="pelleRebuyable.permanentDimensionBoosts" v-show="hasPestilence"/>
        <pelle-currency currency="chaos" :rebuyable="pelleRebuyable.permanentGalaxies" v-show="hasChaos"/>
      </div>
      <button @click="showBoughtUpgrades = !showBoughtUpgrades">Show/Hide bought upgrades</button>
      <div class="pelle-upgrades--container">
        <pelle-upgrade v-for="upg in visibleUpgrades" :upgrade="upg" :key="upg.config.id"/>
        <pelle-upgrade v-for="upg in transparentUpgrades" :upgrade="upg" :key="upg.config.id" transparent/>
      </div>
    </div>`
});
