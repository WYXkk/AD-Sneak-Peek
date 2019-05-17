"use strict";

const AutomatorGrammar = (function() {
  const Parser = chevrotain.Parser;
  const T = AutomatorLexer.tokenMap;

  // ----------------- parser -----------------
  class AutomatorParser extends Parser {
    constructor() {
      super(AutomatorLexer.tokens, {
        recoveryEnabled: true,
        outputCst: true,
      });

      // eslint-disable-next-line consistent-this
      const $ = this;

      $.RULE("script", () => $.SUBRULE($.block));

      $.RULE("block", () => $.MANY_SEP({
        SEP: T.EOL,
        DEF: () => $.SUBRULE($.command),
      }));

      // This is a bit ugly looking. Chevrotain uses Function.toString() to do crazy
      // optimizations. That clashes with our desire to build our list of commands dynamically.
      // We are creating a function body like this one:
      //      $.RULE("command", () => {
      //          $.OR(
      //            $.c1 || ($.c1 = [
      //              { ALT: () => $.SUBRULE($.badCommand) },
      //              { ALT: () => $.SUBRULE($.auto) },
      //              { ALT: () => $.SUBRULE($.define) },
      //              { ALT: () => $.SUBRULE($.ifBlock) },

      const commandAlts = [
        "$.SUBRULE($.badCommand)",
        "$.CONSUME(chevrotain.EOF)",
      ];

      for (const cmd of AutomatorCommands) {
        $.RULE(cmd.id, cmd.rule($));
        commandAlts.push(`$.SUBRULE($.${cmd.id})`);
      }

      const commandOr = window.Function("$", `
        return () => $.OR($.c1 || ($.c1 = [
          ${commandAlts.map(e => `{ ALT: () => ${e} },`).join("\n")}]));
      `);

      $.RULE("command", commandOr($));

      $.RULE("badCommand", () => $.AT_LEAST_ONE(() => $.SUBRULE($.badCommandToken)),
        { resyncEnabled: false, }
      );

      $.RULE("badCommandToken", () => $.OR([
        { ALT: () => $.CONSUME(T.Identifier) },
        { ALT: () => $.CONSUME(T.NumberLiteral) },
        { ALT: () => $.CONSUME(T.ComparisonOperator) },
      ]), { resyncEnabled: false, });

      $.RULE("comparison", () => {
        $.OR([
          {
            ALT: () => {
              $.CONSUME(T.Currency);
              $.CONSUME(T.ComparisonOperator);
              $.SUBRULE($.compareValue);
            }
          },
          {
            ALT: () => {
              $.SUBRULE1($.compareValue);
              $.CONSUME1(T.ComparisonOperator);
              $.CONSUME1(T.Currency);
            }
          },
        ]);
      });

      $.RULE("compareValue", () => $.OR([
        { ALT: () => $.CONSUME(T.NumberLiteral) },
        { ALT: () => $.CONSUME(T.Identifier) },
      ]));

      $.RULE("duration", () => {
        $.CONSUME(T.NumberLiteral);
        $.CONSUME(T.TimeUnit);
      });

      $.RULE("eternityChallenge", () => $.OR([
        {
          ALT: () => {
            $.CONSUME(T.EC);
            $.CONSUME(T.NumberLiteral);
          }
        },
        { ALT: () => $.CONSUME(T.ECLiteral) }
      ]));

      $.RULE("studyList", () => {
        $.AT_LEAST_ONE(() => $.SUBRULE($.studyListEntry));
        // Support the |3 export format for EC number
        $.OPTION2(() => {
          $.CONSUME(T.Pipe);
          $.CONSUME1(T.NumberLiteral);
        });
      }, { resyncEnabled: false });

      $.RULE("studyListEntry", () => {
        $.OPTION(() => $.CONSUME(T.Ellipsis));
        $.OR([
          { ALT: () => $.CONSUME(T.NumberLiteral) },
          { ALT: () => $.CONSUME(T.StudyPath) },
        ]);
        $.OPTION1(() => $.CONSUME(T.Comma));
      });
      // Very important to call this after all the rules have been setup.
      // otherwise the parser may not work correctly as it will lack information
      // derived from the self analysis.
      $.performSelfAnalysis();
    }
  }

  const parser = new AutomatorParser();

  return {
    parser,
    // This field is filled in by automator-validate.js
    validate: null,
  };
}());


/*
const input = `~ ~ ~
pause
`;

$(document).ready(() => {
  for (let repeat = 0; repeat < 2; ++repeat) {

});
if (AutomatorGrammar.parser.errors.length > 0) {
  throw Error(
    "Sad sad panda, parsing errors detected!\n" +
    AutomatorGrammar.parser.errors[0].message
  )
}
*/