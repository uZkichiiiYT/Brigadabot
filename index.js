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
    PermissionsBitField
} = require('discord.js');

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
// 📊 FINANZ SYSTEM
// =========================

let finance = {
    sanctions: 0,
    weekly: 0,
    donations: 0
};

let financeMessageId = null;

// =========================
// 🟢 BOT START
// =========================

client.once(Events.ClientReady, () => {
    console.log(`✅ Online als ${client.user.tag}`);
});

// =========================
// 📊 FINANZ EMBED
// =========================

function buildFinanceEmbed() {

    const total = finance.sanctions + finance.weekly + finance.donations;

    return new EmbedBuilder()
        .setTitle("🏦 Finanz Übersicht")
        .addFields(
            { name: "💰 Gesamtkasse", value: `${total}$` },
            { name: "🚫 Sanktionen", value: `${finance.sanctions}$`, inline: true },
            { name: "💷 Wochenabgaben", value: `${finance.weekly}$`, inline: true },
            { name: "🎁 Spenden", value: `${finance.donations}$`, inline: true }
        )
        .setColor(0x00bfff)
        .setFooter({ text: "Brigada Finanzsystem" })
        .setTimestamp();
}

// =========================
// 📌 PANEL
// =========================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    // =========================
    // PANEL CREATE
    // =========================

    if (message.content === "!panel" || message.content === "!panelrl") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Keine Rechte");
        }

        // =========================
        // ABMELDUNG
        // =========================

        const abmelden = message.guild.channels.cache.find(c => c.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻");

        if (abmelden) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("abmelden")
                    .setLabel("📅 Abmelden")
                    .setStyle(ButtonStyle.Primary)
            );

            abmelden.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🚑 Abmeldung")
                        .setDescription("Klicke um dich abzumelden")
                        .setColor(0x0099ff)
                ],
                components: [row]
            });
        }

        // =========================
        // SANKTION PANEL
        // =========================

        const sanktion = message.guild.channels.cache.find(c => c.name === "📓┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻-verwaltung");

        if (sanktion) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("sanktion")
                    .setLabel("🚫 Sanktion")
                    .setStyle(ButtonStyle.Danger)
            );

            sanktion.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🚫 Sanktionen")
                        .setDescription("Erstelle Sanktionen")
                        .setColor(0xff0000)
                ],
                components: [row]
            });
        }

        // =========================
        // WOCHENABGABE PANEL
        // =========================

        const weekly = message.guild.channels.cache.find(c => c.name === "💷┃𝐖𝐨𝐜𝐡𝐞𝐧𝐚𝐛𝐠𝐚𝐛𝐞-verwaltung");

        if (weekly) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("weekly")
                    .setLabel("💷 Wochenabgabe")
                    .setStyle(ButtonStyle.Success)
            );

            weekly.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("💷 Wochenabgaben")
                        .setDescription("Abgaben verwalten")
                        .setColor(0x00ff99)
                ],
                components: [row]
            });
        }

        // =========================
        // FINANZ CHANNEL
        // =========================

        const financeChannel = message.guild.channels.cache.find(c => c.name === "🏦┃𝗙𝗶𝗻𝗮𝗻𝘇-𝘂𝗲𝗯𝗲𝗿𝘀𝗶𝗰𝗵𝘁");

        if (financeChannel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("finance_edit")
                    .setLabel("✏️ Edit")
                    .setStyle(ButtonStyle.Secondary)
            );

            const msg = await financeChannel.send({
                embeds: [buildFinanceEmbed()],
                components: [row]
            });

            financeMessageId = msg.id;
        }

        message.reply("✅ Panels geladen / aktualisiert");
    }
});

// =========================
// 🔘 INTERACTIONS
// =========================

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isButton()) {

        // =========================
        // ABMELDUNG
        // =========================

        if (interaction.customId === "abmelden") {

            const modal = new ModalBuilder()
                .setCustomId("abmelden_modal")
                .setTitle("Abmeldung");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("grund")
                        .setLabel("Grund")
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

            return interaction.showModal(modal);
        }

        // =========================
        // SANKTION
        // =========================

        if (interaction.customId === "sanktion") {

            const modal = new ModalBuilder()
                .setCustomId("sanktion_modal")
                .setTitle("Sanktion");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("user")
                        .setLabel("User")
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("geld")
                        .setLabel("Betrag")
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("grund")
                        .setLabel("Grund")
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

            return interaction.showModal(modal);
        }

        // =========================
        // WOCHENABGABE
        // =========================

        if (interaction.customId === "weekly") {

            const modal = new ModalBuilder()
                .setCustomId("weekly_modal")
                .setTitle("Wochenabgabe");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("user")
                        .setLabel("User")
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("betrag")
                        .setLabel("Betrag")
                        .setStyle(TextInputStyle.Short)
                )
            );

            return interaction.showModal(modal);
        }

        // =========================
        // FINANZ EDITOR
        // =========================

        if (interaction.customId === "finance_edit") {

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: "❌ Kein Zugriff", ephemeral: true });
            }

            const modal = new ModalBuilder()
                .setCustomId("finance_modal")
                .setTitle("Finanz Editor");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("sanctions")
                        .setLabel("Sanktionen + / -")
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("weekly")
                        .setLabel("Wochenabgaben + / -")
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("donations")
                        .setLabel("Spenden + / -")
                        .setStyle(TextInputStyle.Short)
                )
            );

            return interaction.showModal(modal);
        }
    }

    // =========================
    // MODALS
    // =========================

    if (!interaction.isModalSubmit()) return;

    // =========================
    // SANKTION
    // =========================

    if (interaction.customId === "sanktion_modal") {

        const user = interaction.fields.getTextInputValue("user");
        const geld = parseInt(interaction.fields.getTextInputValue("geld"));
        const grund = interaction.fields.getTextInputValue("grund");

        finance.sanctions += geld;

        updateFinance(interaction.guild);

        return interaction.reply({ content: "✅ Sanktion gespeichert", ephemeral: true });
    }

    // =========================
    // WOCHENABGABE
    // =========================

    if (interaction.customId === "weekly_modal") {

        const betrag = parseInt(interaction.fields.getTextInputValue("betrag"));

        finance.weekly += betrag;

        updateFinance(interaction.guild);

        return interaction.reply({ content: "✅ Wochenabgabe gespeichert", ephemeral: true });
    }

    // =========================
    // FINANZ EDIT
    // =========================

    if (interaction.customId === "finance_modal") {

        finance.sanctions += parseInt(interaction.fields.getTextInputValue("sanctions")) || 0;
        finance.weekly += parseInt(interaction.fields.getTextInputValue("weekly")) || 0;
        finance.donations += parseInt(interaction.fields.getTextInputValue("donations")) || 0;

        updateFinance(interaction.guild);

        return interaction.reply({ content: "✅ Finanz aktualisiert", ephemeral: true });
    }
});

// =========================
// 🔄 FINANZ UPDATE
// =========================

async function updateFinance(guild) {

    const channel = guild.channels.cache.find(c => c.name === "🏦┃𝗙𝗶𝗻𝗮𝗻𝘇-𝘂𝗲𝗯𝗲𝗿𝘀𝗶𝗰𝗵𝘁");
    if (!channel || !financeMessageId) return;

    const msg = await channel.messages.fetch(financeMessageId).catch(() => null);
    if (!msg) return;

    await msg.edit({
        embeds: [buildFinanceEmbed()]
    });
}

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);