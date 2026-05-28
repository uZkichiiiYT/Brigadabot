const {
    Client,
    GatewayIntentBits,
    Events,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    PermissionsBitField,
    StringSelectMenuBuilder
} = require('discord.js');

const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// =========================
// 💾 DATABASE
// =========================
const DB = "./finance.json";

function getBal() {
    if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({ balance: 0 }));
    return JSON.parse(fs.readFileSync(DB)).balance;
}

function setBal(v) {
    fs.writeFileSync(DB, JSON.stringify({ balance: v }));
}

function addBal(v) {
    const newBal = getBal() + v;
    setBal(newBal);
    return newBal;
}

// =========================
// 🟢 START
// =========================
client.once(Events.ClientReady, () => {
    console.log(`✅ Online als ${client.user.tag}`);
});

// =========================
// 📌 PANEL
// =========================
client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.reply("❌ Keine Rechte");

        // =========================
        // 💰 FINANCE PANEL
        // =========================
        const finance = message.guild.channels.cache.find(ch =>
            ch.name === "💰┃finanz-übersicht"
        );

        if (finance) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("fin_add").setLabel("➕ Einzahlen").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("fin_remove").setLabel("➖ Abziehen").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("fin_edit").setLabel("✏️ Bearbeiten").setStyle(ButtonStyle.Secondary)
            );

            const embed = new EmbedBuilder()
                .setTitle("🏦 Finanz Übersicht")
                .setDescription(`💰 Gesamtkasse: **${getBal().toLocaleString()}$**`)
                .setColor(0x00ffcc);

            await finance.send({ embeds: [embed], components: [row] });
        }

        // =========================
        // 🚫 SANKTION PANEL
        // =========================
        const sanc = message.guild.channels.cache.find(ch =>
            ch.name === "📓┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻-verwaltung"
        );

        if (sanc) {

            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("sanktion_select")
                    .setPlaceholder("§ auswählen")
                    .addOptions(
                        ...Array.from({ length: 19 }, (_, i) => ({
                            label: `§${i + 1}`,
                            value: `§${i + 1}`
                        }))
                    )
            );

            const embed = new EmbedBuilder()
                .setTitle("🚫 Sanktion System")
                .setDescription("Wähle einen § aus und erstelle Sanktion")
                .setColor(0xff0000);

            await sanc.send({ embeds: [embed], components: [menu] });
        }

        message.reply("✅ Panels erstellt");
    }
});

// =========================
// 🔘 INTERACTIONS
// =========================
client.on(Events.InteractionCreate, async interaction => {

    // =========================
    // FINANCE BUTTONS
    // =========================
    if (interaction.isButton()) {

        if (interaction.customId === "fin_add" || interaction.customId === "fin_remove") {

            const modal = new ModalBuilder()
                .setCustomId(interaction.customId + "_modal")
                .setTitle("Finanzen");

            const amount = new TextInputBuilder()
                .setCustomId("amount")
                .setLabel("Betrag")
                .setStyle(TextInputStyle.Short);

            const reason = new TextInputBuilder()
                .setCustomId("reason")
                .setLabel("Grund")
                .setStyle(TextInputStyle.Short);

            modal.addComponents(
                new ActionRowBuilder().addComponents(amount),
                new ActionRowBuilder().addComponents(reason)
            );

            return interaction.showModal(modal);
        }

        if (interaction.customId === "fin_edit") {

            const modal = new ModalBuilder()
                .setCustomId("fin_edit_modal")
                .setTitle("Bearbeiten");

            const amount = new TextInputBuilder()
                .setCustomId("amount")
                .setLabel("Neuer Stand")
                .setStyle(TextInputStyle.Short);

            modal.addComponents(new ActionRowBuilder().addComponents(amount));

            return interaction.showModal(modal);
        }
    }

    // =========================
    // SANKTION SELECT
    // =========================
    if (interaction.isStringSelectMenu() && interaction.customId === "sanktion_select") {

        const modal = new ModalBuilder()
            .setCustomId("sanktion_modal")
            .setTitle("Sanktion erstellen");

        const user = new TextInputBuilder()
            .setCustomId("user")
            .setLabel("User")
            .setStyle(TextInputStyle.Short);

        const cost = new TextInputBuilder()
            .setCustomId("cost")
            .setLabel("Kosten (z.B 100000 - 350000)")
            .setStyle(TextInputStyle.Short);

        const reason = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel(`Grund (${interaction.values[0]})`)
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(cost),
            new ActionRowBuilder().addComponents(reason)
        );

        return interaction.showModal(modal);
    }

    // =========================
    // MODALS FINANCE
    // =========================
    if (interaction.isModalSubmit()) {

        // ➕ EINZAHLEN
        if (interaction.customId === "fin_add_modal") {
            const amount = Number(interaction.fields.getTextInputValue("amount"));
            const reason = interaction.fields.getTextInputValue("reason");

            const bal = addBal(amount);

            return interaction.reply({
                content: `➕ +${amount}$ | ${reason}\n🏦 ${bal.toLocaleString()}$`,
                ephemeral: true
            });
        }

        // ➖ ABZIEHEN
        if (interaction.customId === "fin_remove_modal") {
            const amount = Number(interaction.fields.getTextInputValue("amount"));
            const reason = interaction.fields.getTextInputValue("reason");

            const bal = addBal(-amount);

            return interaction.reply({
                content: `➖ -${amount}$ | ${reason}\n🏦 ${bal.toLocaleString()}$`,
                ephemeral: true
            });
        }

        // ✏️ EDIT
        if (interaction.customId === "fin_edit_modal") {
            const amount = Number(interaction.fields.getTextInputValue("amount"));

            setBal(amount);

            return interaction.reply({
                content: `✏️ Neuer Stand: ${amount.toLocaleString()}$`,
                ephemeral: true
            });
        }

        // 🚫 SANKTION FINAL
        if (interaction.customId === "sanktion_modal") {

            const user = interaction.fields.getTextInputValue("user");
            const cost = interaction.fields.getTextInputValue("cost");
            const reason = interaction.fields.getTextInputValue("reason");

            const channel = interaction.guild.channels.cache.find(ch =>
                ch.name === "🚫┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻"
            );

            const embed = new EmbedBuilder()
                .setTitle("🚫 Sanktion")
                .addFields(
                    { name: "User", value: user },
                    { name: "Kosten", value: cost },
                    { name: "Grund", value: reason }
                )
                .setColor(0xff0000);

            channel.send({ embeds: [embed] });

            // automatisch in Finanzen einrechnen
            addBal(-Number(cost.split(" ")[0]) || 0);

            return interaction.reply({
                content: "✅ Sanktion erstellt & verbucht",
                ephemeral: true
            });
        }
    }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);