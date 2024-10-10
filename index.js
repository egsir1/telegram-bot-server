const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "7654944321:AAEydYw41ORkN0ycdCMFo-tlurUwNMKiwVs";

const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: true,
  })
);

const bootstrap = () => {
  bot.setMyCommands([
    {
      command: "/start",
      description: "Start",
    },
    {
      command: "/courses",
      description: "All courses",
    },
  ]);
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    console.log("🚀 ~ bot.on ~ text:", text);

    if (text === "/start") {
      await bot.sendMessage(
        chatId,
        "Welcome to Mindcraft online-courses platform ",
        {
          reply_markup: {
            keyboard: [
              [
                {
                  text: "Check courses",
                  web_app: {
                    url: "https://bargaino.net ",
                  },
                },
              ],
            ],
            resize_keyboard: true,
          },
        }
      );
    }

    if (text === "/courses") {
      await bot.sendMessage(
        chatId,
        "Welcome to Mindcraft online-courses platform",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Check courses",
                  web_app: {
                    url: "https://bargaino.net",
                  },
                },
              ],
            ],
          },
        }
      );
    }

    if (msg.web_app_data?.data) {
      console.log(
        "🚀 ~ bot.on ~ msg.web_app_data?.data:",
        msg.web_app_data?.data
      );

      try {
        const data = JSON.parse(msg.web_app_data?.data);

        await bot.sendMessage(
          chatId,
          "Thank you for your purchase! Here is the list of your purchased courses:"
        );

        for (item of data) {
          await bot.sendPhoto(chatId, item.Image);
          await bot.sendMessage(chatId, `${item.title} - ${item.quantity}x`);
        }

        await bot.sendMessage(
          chatId,
          `Total price - ${data
            .reduce((a, c) => a + c.price * c.quantity, 0)
            .toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })} `
        );
      } catch (err) {
        console.log(err);
      }
    }
  });
};

bootstrap();

app.post("/web-data", async (req, res) => {
  const { queryID, products } = req.body;
  console.log("🚀 ~ app.post ~ req.body:", req.body);

  try {
    await bot.answerWebAppQuery(queryID, {
      type: "article",
      id: queryID,
      title: "Muvaffaqiyatli xarid qildingiz",
      input_message_content: {
        message_text: `Xaridingiz bilan tabriklayman, siz ${products
          .reduce((a, c) => a + c.price * c.quantity, 0)
          .toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })} qiymatga ega mahsulot sotib oldingiz, ${products
          .map((c) => `${c.title} ${c.quantity}X`)
          .join(", ")}`,
      },
    });
    return res.status(200).json({});
  } catch (error) {
    return res.status(500).json({});
  }
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server started on port 8000`);
});
