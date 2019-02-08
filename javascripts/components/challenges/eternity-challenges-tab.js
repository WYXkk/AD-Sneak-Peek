Vue.component("eternity-challenges-tab", {
  components: {
    "eternity-challenge-box": {
      props: {
        challengeId: Number
      },
      data() {
        return {
          isUnlocked: false,
          isRunning: false,
          isCompleted: false,
          completions: 0,
          showGoalSpan: false,
        };
      },
      computed: {
        challenge() {
          return EternityChallenge(this.challengeId);
        },
        config() {
          return this.challenge.config;
        },
        rewardConfig() {
          return this.config.reward;
        },
        goalDisplay() {
          const config = this.config;
          let goal = `Goal: ${this.goalAtCompletions(this.completions)} IP`;
          if (config.restriction) {
            goal += ` ${config.formatRestriction(config.restriction(this.completions))}`;
          }
          return goal;
        },
        firstGoal() {
          return this.goalAtCompletions(0);
        },
        lastGoal() {
          return this.goalAtCompletions(TIERS_PER_EC);
        },
        currentRewardConfig() {
          const challenge = this.challenge;
          const config = this.config.reward;
          return {
            effect: () => config.effect(challenge.completions),
            formatEffect: config.formatEffect,
            cap: config.cap,
          };
        },
        nextRewardConfig() {
          const challenge = this.challenge;
          const config = this.config.reward;
          return {
            effect: () => config.effect(challenge.completions + 1),
            formatEffect: config.formatEffect,
            cap: config.cap,
          };
        },
        name() {
          return `EC${this.challengeId}`;
        }
      },
      methods: {
        update() {
          const challenge = this.challenge;
          this.isUnlocked = challenge.isUnlocked;
          this.isRunning = challenge.isRunning;
          this.isCompleted = challenge.isFullyCompleted;
          this.completions = challenge.completions;
          this.showGoalSpan = player.realities > 0;
        },
        start() {
          this.challenge.start();
        },
        goalAtCompletions(completions) {
          return shorten(this.challenge.goalAtCompletions(completions), 2, 1);
        }
      },
      template:
        `<challenge-box
          :name="name"
          :isUnlocked="isUnlocked"
          :isRunning="isRunning"
          :isCompleted="isCompleted"
          class="c-challenge-box--eternity"
          @start="start"
        >
          <description-display :config="config" slot="top" />
          <template slot="bottom">
            <div :style="{ visiblity: completions < 5 ? 'visible' : 'hidden' }">
              <span>Completed {{completions}} {{"time" | pluralize(completions)}}</span>
              <br>
              <span>{{goalDisplay}}</span>
            </div>
            <span v-if="showGoalSpan">Goal Span: {{firstGoal}} IP - {{lastGoal}} IP</span>
            <span>
              Reward: 
              <description-display
                :config="config.reward"
                :length="55"
                name="c-challenge-box__reward-description"
              />
            </span>
            <span>
              <effect-display v-if="completions > 0" :config="currentRewardConfig" />
              <span v-if="completions > 0 && completions < 5">|</span>
              <effect-display v-if="completions < 5" :config="nextRewardConfig" title="Next" />
            </span>
          </template>
        </challenge-box>`
    }
  },
  data() {
    return {
      unlockedCount: 0
    };
  },
  methods: {
    update() {
      this.unlockedCount = [...Array(12).keys()]
        .filter(id => this.isChallengeVisible(id + 1))
        .length;
    },
    isChallengeVisible(id) {
      const challenge = EternityChallenge(id);
      return challenge.completions > 0 || challenge.isUnlocked;
    }
  },
  template:
    `<div>
      <div>Complete Eternity Challenges again for a bigger reward, maximum of 5 times.</div>
      <div>(You have unlocked {{unlockedCount}} out of 12 Eternity Challenges)</div>
      <challenge-grid :count="12" :isChallengeVisible="isChallengeVisible">
        <eternity-challenge-box slot-scope="slotProps" :challengeId="slotProps.challengeId" />
      </challenge-grid>
    </div>`
});