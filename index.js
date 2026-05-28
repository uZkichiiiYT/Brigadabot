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
} = require("discord.js");

require("dotenv").config();

// ==========================================
// 🟢 CLIENT
// ==========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ==========================================
// 💰 FINANZEN
// ==========================================

let familienKasse = 10000000;
let finanzMessageId = null;

// ==========================================
// 🔐 ROLLEN
// ==========================================

const sanktionRoles = [
    "⌊12⌉ 👑 Chrestnik Leader",
    "⌊11⌉ 👑 Smotriaschi",
    "⌊10⌉ 👑 Glava",
    "⌊.⌉ 👑 Leaderschaft",
    "⌊🚩⌉ Sanktion Verwaltung"
];

// ==========================================
// 💰 FINANZ OVERVIEW
// ==========================================

async function updateFinanzOverview(
    guild,
    grund = "Keine Änderung",
    bearbeiter = "System"
) {

    const channel = guild.channels.cache.find(
        ch => ch.name === "💰┃finanz-übersicht"
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("💰 Brigada Finanzübersicht")
        .setDescription(`
🏦 Gesamtkasse:
${familienKasse.toLocaleString()}$

━━━━━━━━━━━━━━━━━━

📌 Letzte Änderung:
${grund}

👮 Bearbeitet von:
${bearbeiter}
        `)
        .setColor(0x00ff99)
        .setTimestamp();

    if (finanzMessageId) {

        try {

            const oldMessage = await channel.messages.fetch(finanzMessageId);

            await oldMessage.edit({
                embeds: [embed]
            });

            return;

        } catch (err) {
            finanzMessageId = null;
        }
    }

    const msg = await channel.send({
        embeds: [embed]
    });

    finanzMessageId = msg.id;
}

// ==========================================
// 🟢 BOT ONLINE
// ==========================================

client.once(Events.ClientReady, () => {

    console.log(`✅ Bot online als ${client.user.tag}`);
});

// ==========================================
// 📌 PANEL COMMAND
// ==========================================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Keine Rechte");
        }

        // ==========================================
        // 🚫 SANKTION PANEL
        // ==========================================

        const sanktionPanel = message.guild.channels.cache.find(
            ch => ch.name === "📓┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻-verwaltung"
        );

        if (sanktionPanel) {

            const row = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setCustomId("sanktion")
                    .setLabel("🚫 Sanktion")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("wochenabgabe")
                    .setLabel("💷 Wochenabgabe")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("spende")
                    .setLabel("🤝 Spende")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("finanz")
                    .setLabel("✏️ Finanz ändern")
                    .setStyle(ButtonStyle.Secondary)
            );

            const embed = new EmbedBuilder()
                .setTitle("📓 Brigada Verwaltung")
                .setDescription(`
🔘 Nutze die Buttons unten

• Sanktionen
• Wochenabgaben
• Spenden
• Finanz Änderungen
                `)
                .setColor(0xff0000);

            sanktionPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        await updateFinanzOverview(message.guild);

        message.reply("✅ Panel erstellt");
    }
});

// ==========================================
// 🔘 BUTTONS
// ==========================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    // ==========================================
    // 🚫 SANKTION
    // ==========================================

    if (interaction.customId === "sanktion") {

        const hasRole = interaction.member.roles.cache.some(role =>
            sanktionRoles.includes(role.name)
        );

        if (!hasRole) {

            return interaction.reply({
                content: "❌ Keine Rechte",
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId("sanktion_modal")
            .setTitle("🚫 Sanktion");

        const user = new TextInputBuilder()
            .setCustomId("user")
            .setLabel("Discord Name")
            .setStyle(TextInputStyle.Short);

        const paragraf = new TextInputBuilder()
            .setCustomId("paragraf")
            .setLabel("§ Nummer")
            .setStyle(TextInputStyle.Short);

        const geld = new TextInputBuilder()
            .setCustomId("geld")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId("grund")
            .setLabel("Erweiterung / Zusatz")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(paragraf),
            new ActionRowBuilder().addComponents(geld),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }

    // ==========================================
    // 💷 WOCHENABGABE
    // ==========================================

    if (interaction.customId === "wochenabgabe") {

        const modal = new ModalBuilder()
            .setCustomId("wochen_modal")
            .setTitle("💷 Wochenabgabe");

        const user = new TextInputBuilder()
            .setCustomId("user")
            .setLabel("Discord Name")
            .setStyle(TextInputStyle.Short);

        const geld = new TextInputBuilder()
            .setCustomId("geld")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(geld)
        );

        await interaction.showModal(modal);
    }

    // ==========================================
    // 🤝 SPENDE
    // ==========================================

    if (interaction.customId === "spende") {

        const modal = new ModalBuilder()
            .setCustomId("spende_modal")
            .setTitle("🤝 Spende");

        const user = new TextInputBuilder()
            .setCustomId("user")
            .setLabel("Discord Name")
            .setStyle(TextInputStyle.Short);

        const geld = new TextInputBuilder()
            .setCustomId("geld")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(geld)
        );

        await interaction.showModal(modal);
    }

    // ==========================================
    // ✏️ FINANZ ÄNDERN
    // ==========================================

    if (interaction.customId === "finanz") {

        const modal = new ModalBuilder()
            .setCustomId("finanz_modal")
            .setTitle("✏️ Finanz ändern");

        const geld = new TextInputBuilder()
            .setCustomId("geld")
            .setLabel("Betrag (+ oder -)")
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId("grund")
            .setLabel("Grund")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(geld),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }
});

// ==========================================
// 📝 MODALS
// ==========================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    // ==========================================
    // 🚫 SANKTION
    // ==========================================

    if (interaction.customId === "sanktion_modal") {

        const userInput = interaction.fields.getTextInputValue("user");
        const paragraf = interaction.fields.getTextInputValue("paragraf");
        const geld = Number(
            interaction.fields.getTextInputValue("geld")
        );

        const grund = interaction.fields.getTextInputValue("grund");

        familienKasse += geld;

        const channel = interaction.guild.channels.cache.find(
            ch => ch.name === "🚫┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻"
        );

        const embed = new EmbedBuilder()
            .setTitle("🚫 Neue Sanktion")
            .setDescription(`
👤 User:
${userInput}

📜 Paragraph:
${paragraf}

💸 Betrag:
${geld.toLocaleString()}$

📌 Zusatz:
${grund}

👮 Bearbeiter:
${interaction.user.tag}
            `)
            .setColor(0xff0000)
            .setTimestamp();

        if (channel) {
            channel.send({
                embeds: [embed]
            });
        }

        await updateFinanzOverview(
            interaction.guild,
            `Sanktion +${geld.toLocaleString()}$`,
            interaction.user.tag
        );

        interaction.reply({
            content: "✅ Sanktion erstellt",
            ephemeral: true
        });
    }

    // ==========================================
    // 💷 WOCHENABGABE
    // ==========================================

    if (interaction.customId === "wochen_modal") {

        const user = interaction.fields.getTextInputValue("user");

        const geld = Number(
            interaction.fields.getTextInputValue("geld")
        );

        familienKasse += geld;

        await updateFinanzOverview(
            interaction.guild,
            `Wochenabgabe +${geld.toLocaleString()}$ von ${user}`,
            interaction.user.tag
        );

        interaction.reply({
            content: "✅ Wochenabgabe eingetragen",
            ephemeral: true
        });
    }

    // ==========================================
    // 🤝 SPENDE
    // ==========================================

    if (interaction.customId === "spende_modal") {

        const user = interaction.fields.getTextInputValue("user");

        const geld = Number(
            interaction.fields.getTextInputValue("geld")
        );

        familienKasse += geld;

        await updateFinanzOverview(
            interaction.guild,
            `Spende +${geld.toLocaleString()}$ von ${user}`,
            interaction.user.tag
        );

        interaction.reply({
            content: "✅ Spende eingetragen",
            ephemeral: true
        });
    }

    // ==========================================
    // ✏️ FINANZ ÄNDERN
    // ==========================================

    if (interaction.customId === "finanz_modal") {

        const geld = Number(
            interaction.fields.getTextInputValue("geld")
        );

        const grund = interaction.fields.getTextInputValue("grund");

        familienKasse += geld;

        await updateFinanzOverview(
            interaction.guild,
            `${grund} (${geld.toLocaleString()}$)`,
            interaction.user.tag
        );

        interaction.reply({
            content: "✅ Finanzen geändert",
            ephemeral: true
        });
    }
});

// ==========================================
// 🔑 LOGIN
// ==========================================

client.login(process.env.TOKEN);