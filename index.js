
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

// Initialize habit tracker data structure
const habitData = {
  habits: [],
  logs: [],
  statistics: {},
};

// Conversation history for multi-turn interactions
const conversationHistory = [];

// Function to add a new habit
function addHabit(habitName, description = "") {
  const habit = {
    id: habitData.habits.length + 1,
    name: habitName,
    description: description,
    createdAt: new Date().toISOString(),
  };
  habitData.habits.push(habit);
  return habit;
}

// Function to log a habit completion
function logHabitCompletion(habitId, date = new Date().toISOString()) {
  const log = {
    habitId: habitId,
    completedAt: date,
    notes: "",
  };
  habitData.logs.push(log);
  return log;
}

// Function to calculate statistics
function calculateStatistics() {
  const stats = {};

  for (const habit of habitData.habits) {
    const completions = habitData.logs.filter(
      (log) => log.habitId === habit.id
    ).length;
    const daysSinceCreation = Math.floor(
      (new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)
    );
    const completionRate =
      daysSinceCreation > 0 ? (completions / daysSinceCreating) * 100 : 0;

    stats[habit.id] = {
      habitName: habit.name,
      totalCompletions: completions,
      daysSinceCreation: daysSinceCreation,
      completionRate: Math.round(completionRate * 100) / 100,
      lastCompleted: habitData.logs
        .filter((log) => log.habitId === habit.id)
        .pop()?.completedAt,
    };
  }

  habitData.statistics = stats;
  return stats;
}

// Function to format habit data for Claude
function formatHabitDataForClaude() {
  const stats = calculateStatistics();
  return {
    totalHabits: habitData.habits.length,
    habits: habitData.habits,
    recentLogs: habitData.logs.slice(-10),
    statistics: stats,
  };
}

// Function to handle Claude conversation
async function chatWithClaude(userMessage) {
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  const habitDataContext = formatHabitDataForClaude();

  const systemPrompt = `You are a helpful habit tracking assistant. You help users manage their healthy habits and provide insights into their progress.

Current Habit Tracker Data:
${JSON.stringify(habitDataContext, null, 2)}

Available commands the user can ask you to perform:
1. "Add habit [name]" - Add a new habit
2. "Log habit [habit name]" - Log completion of a habit
3. "Show statistics" - Display habit statistics
4. "List habits" - Show all habits
5. "Get advice" - Get health and habit advice

Respond conversationally and helpfully. If the user asks to add or log habits, confirm the action. Provide insights based on the current data.`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: conversationHistory,
  });

  const assistantMessage = response.content[0].text;

  conversationHistory.push({
    role: "assistant",
    content: assistantMessage,
  });

  return assistantMessage;
}

// Function to process commands
function processCommand(input) {
  const lowerInput = input.toLowerCase();

  if (lowerInput.startsWith("add habit ")) {
    const habitName = input.substring(9).trim();
    const habit = addHabit(habitName);
    return `Added habit: ${habit.name}`;
  }

  if (lowerInput.startsWith("log habit ")) {
    const habitName = input.substring(9).trim();
    const habit = habitData.habits.find(
      (h) => h.name.toLowerCase() === habitName.toLowerCase()
    );
    if (habit) {
      logHabitCompletion(habit.id);
      return `Logged completion for: ${habit.name}`;
    }
    return `Habit not found: ${habitName}`;
  }

  if (lowerInput === "show statistics") {
    const stats = calculateStatistics();
    return `Statistics:\n${JSON.stringify(stats, null, 2)}`;
  }

  if (lowerInput === "list habits") {
    if (habitData.habits.length === 0) {
      return "No habits tracked yet.";
    }
    return (
      "Tracked habits:\n" +
      habitData.habits
        .map((h) => `- ${h.name} (ID: ${h.id})`)
        .join("\n")
    );
  }

  return null;
}

// Main function
async function main() {
  console.log("🏃 Healthy Habits Tracker");
  console.log("========================");
  console.log("Chat with Claude AI about your habits and health goals.");
  console.log(
    'Commands: "add habit", "log habit", "show statistics", "list habits", "get advice"'
  );
  console.log('Type "exit" to quit.\n');

  // Initialize with some demo data
  addHabit("Morning Exercise", "30 minutes of physical activity");
  addHabit("Drink Water", "8 glasses of water daily");
  addHabit("Meditation", "10 minutes mindfulness");
  logHabitCompletion(1);
  logHabitCompletion(2);
  logHabitCom