Vue.component("modal-reality-glyph-creation", {
  data() {
    return {
      realityGlyphLevel: 0,
      // This contains an array where each entry is an array looking like [4000, "realitygalaxies"]
      possibleEffects: [],
    };
  },
  methods: {
    update() {
      this.realityGlyphLevel = AlchemyResource.reality.effectValue;
      const realityEffectConfigs = Object.values(GameDatabase.reality.glyphEffects)
        .filter(eff => eff.id.match("reality*"))
        .sort((a, b) => a.bitmaskIndex - b.bitmaskIndex);
      const minRealityEffectIndex = realityEffectConfigs.map(cfg => cfg.bitmaskIndex).min();
      this.possibleEffects = realityEffectConfigs
        .map(cfg => [realityGlyphEffectLevelThresholds[cfg.bitmaskIndex - minRealityEffectIndex], cfg.id]);
    },
    createRealityGlyph() {
      if (Glyphs.freeInventorySpace === 0) {
        Modal.message.show("Inventory cannot hold new Glyphs. Delete/sacrifice (shift-click) some Glyphs.");
        return;
      }
      Glyphs.addToInventory(GlyphGenerator.realityGlyph(this.realityGlyphLevel));
      AlchemyResource.reality.amount = 0;
      this.emitClose();
    },
    formatGlyphEffect(effect) {
      if (this.realityGlyphLevel < effect[0]) return `(Requires glyph level ${formatInt(effect[0])})`;
      const config = GameDatabase.reality.glyphEffects[effect[1]];
      const value = config.effect(this.realityGlyphLevel, rarityToStrength(100));
      const effectTemplate = typeof config.singleDesc === "function"
        ? config.singleDesc()
        : config.singleDesc;
      return effectTemplate.replace("{value}", config.formatEffect(value));
    }
  },
  template: `
    <div class="c-reality-glyph-creation">
      <modal-close-button @click="emitClose" />
      <h2>Reality Glyph Creation</h2>
      <div>
        Create a level {{ formatInt(realityGlyphLevel) }} Reality Glyph. Rarity will always be 100% and level
        scales on your current reality resource amount (which is all consumed). All other alchemy resources will be
        unaffected. Reality Glyphs have unique effects, some of which are only available with higher level Glyphs.
        Reality Glyphs can also be sacrificed to increase the yield from alchemy reactions. Like Effarig Glyphs,
        you cannot equip more than one at the same time.
      </div>
      <div>
        Available Effects:
      </div>
      <div v-for="effect in possibleEffects">
        {{ formatGlyphEffect(effect) }}
      </div><br>
      <button
        class="o-primary-btn"
        v-on:click="createRealityGlyph()"
        v-if="realityGlyphLevel !== 0"
      >
        Create a Reality Glyph!
      </button>
      <button
        class="o-primary-btn o-primary-btn--disabled"
        v-else
      >
        Reality Glyph level must be higher than {{ formatInt(0) }}
      </button>
    </div>`,
});
