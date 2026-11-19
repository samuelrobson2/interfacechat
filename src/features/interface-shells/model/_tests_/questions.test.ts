import { describe, expect, it } from "vitest";
import { answerText, normalizeQuestions, trailingYesNo, writeAnswer } from "../questions";

const targets = [{ id: "g1", kind: "guide" as const }, { id: "s1", kind: "schedule" as const }];

describe("questions", () => {
  it("binds a question to an interface's field, taking that field's control and unit", () => {
    const [question] = normalizeQuestions({ questions: [{ for: "g1", field: "serves", label: "Guests", ask: "How many are coming?", control: "text", guess: 8 }] }, targets);
    expect(question).toMatchObject({ for: "g1", field: "serves", control: "number", unit: "people", min: 1 });
    // Nothing is pre-picked: a guess the model sends anyway isn't kept.
    expect(question!.guess).toBeUndefined();
  });

  it("drops a question for an interface that isn't in play, keeps a plain one", () => {
    const questions = normalizeQuestions(
      { questions: [{ for: "nope", label: "X", ask: "?", control: "text" }, { for: "chat", label: "Answer", ask: "Want the list?", control: "confirm", guess: "Yes" }] },
      targets,
    );
    expect(questions.map((question) => question.for)).toEqual(["chat"]);
  });

  it("writes an answer straight into the interface", () => {
    const guide = { title: "Pasta bake", facts: [{ label: "Time", value: "1 hour" }], needs: [], steps: [] };
    expect(writeAnswer("guide", guide, "serves", 8)).toMatchObject({ facts: [{ label: "Time", value: "1 hour" }, { label: "Serves", value: "8" }] });
    const schedule = { title: "Shoot", dayCount: 1, hours: [9, 17] as [number, number], tasks: [], constraints: [] };
    expect(writeAnswer("schedule", schedule, "start", "08:30")).toMatchObject({ hours: [8.5, 17] });
    expect(writeAnswer("schedule", schedule, "days", 2)).toMatchObject({ dayCount: 2 });
  });

  it("says an answer in words", () => {
    expect(answerText({ control: "number", unit: "people" }, 8)).toBe("8 people");
    expect(answerText({ control: "time" }, "19:30")).toBe("7:30 pm");
    expect(answerText({ control: "choose" }, ["Vegetarian", "Gluten-free"])).toBe("Vegetarian, Gluten-free");
  });

  it("finds a yes-or-no question at the end of a plain reply, and nothing else", () => {
    expect(trailingYesNo("I drafted the menu. **Want me to make the shopping list next?**")).toBe("Want me to make the shopping list next?");
    expect(trailingYesNo("Which main do you want, the tart or the lasagne?")).toBeNull();
    expect(trailingYesNo("Done, the schedule is ready.")).toBeNull();
  });
});
