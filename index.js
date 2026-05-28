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

// ========================================
// 🟢 CLIENT
// ========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// ========================================
// 💰 FINANZEN
// ========================================

let familienKasse = 10000000;
let finanzMessageId = null;

// ========================================
// ⏰ DM AUTO DELETE
// ========================================

const deleteTime = 4 * 24 * 60 * 60 * 1000;

// ========================================
// 🔐 ROLLEN
// ========================================

const sanktionRoles = [
    "⌊12⌉ 👑 Chrestnik Leader",
    "⌊11⌉ 👑 Smotriaschi",
    "⌊10⌉ 👑 Glava",
    "⌊.⌉ 👑 Leaderschaft",
    "⌊🚩⌉ Sanktion Verwaltung"
];

const abmeldungRoles = [
    "⌊12⌉ 👑 Chrestnik Leader",
    "⌊11⌉ 👑 Smotriaschi",
    "⌊10⌉ 👑 Glava",
    "⌊.⌉ 👑 Leaderschaft"
];

// ========================================
// 📜 SANKTIONS KATALOG
// ========================================

const paragraphen = {
    "1": "§1 Nichterscheinen bei wichtigen Terminen — 75.000$",
    "2": "§2 Funkdisziplin missachten — 50.000$ - 350.000$",
    "3": "§3 Gewalt gegen Familienmitglieder — 100.000$",
    "4": "§4 Anschießen eines Familienmitglieds — 100.000$",
    "5": "§5 Inaktivität oder fehlende Abmeldung — 250.000$",
    "6": "§6 Respektlosigkeit — 50.000$ - 500.000$",
    "7": "§7 Befehlsverweigerung — 100.000$",
    "8": "§8 Weitergabe interner Informationen — Bloodout",
    "9": "§9 Nichtzahlung Sanktion — +50.000$",
    "10": "§10 Verrat von Mitgliedern — 90.000$",
    "11": "§11 Wochenbeitrag nicht bezahlt — 50.000$",
    "12": "§12 Öffentliches Fehlverhalten — 100.000$ - 350.000$",
    "13": "§13 Familienkleidung abgelegt — 50.000$",
    "14": "§14 Staatsfahrzeug gestohlen — 250.000$",
    "15": "§15 Pflichtaufstellung ignoriert — 100.000$",
    "16": "§16 Sondersanktion",
    "17": "§17 Maske auf Anwesen — 50.000$",
    "18": "§18 Schießen auf Anwesen — 200.000$",
    "19": "§19 Schlagen auf Anwesen — 100.000$"
};

// ========================================
// 💰 FINANZ OVERVIEW
// ========================================

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

            const msg = await channel.messages.fetch(finanzMessageId);

            await msg.edit({
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

// ========================================
// 🟢 BOT ONLINE
// ========================================

client.once(Events.ClientReady, () => {

    console.log(`✅ Bot online als ${client.user.tag}`);
});

// ========================================
// 📌 PANEL
// ========================================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return;
        }

        // ========================================
        // 🚑 ABMELDUNG PANEL
        // ========================================

        const abmeldungPanel = message.guild.channels.cache.find(
            ch => ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻"
        );

        if (abmeldungPanel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("abmeldung")
                    .setLabel("📅 Abmeldung")
                    .setStyle(ButtonStyle.Primary)
            );

            const embed = new EmbedBuilder()
                .setTitle("🚑 Abmeldungs System")
                .setDescription(`
📌 Nutze den Button unten
um dich abzumelden.
                `)
                .setColor(0x0099ff);

            abmeldungPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        // ========================================
        // 📓 VERWALTUNG PANEL
        // ========================================

        const panel = message.guild.channels.cache.find(
            ch => ch.name === "📓┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻-verwaltung"
        );

        if (panel) {

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
                    .setLabel("✏️ Finanz")
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

            panel.send({
                embeds: [embed],
                components: [row]
            });
        }

        await updateFinanzOverview(message.guild);

        message.reply("✅ Panels erstellt");
    }
});

// ========================================
// 🔘 BUTTONS
// ========================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    // ========================================
    // 🚑 ABMELDUNG
    // ========================================

    if (interaction.customId === "abmeldung") {

        const modal = new ModalBuilder()
            .setCustomId("abmeldung_modal")
            .setTitle("📅 Abmeldung");

        const von = new TextInputBuilder()
            .setCustomId("von")
            .setLabel("Von")
            .setStyle(TextInputStyle.Short);

        const bis = new TextInputBuilder()
            .setCustomId("bis")
            .setLabel("Bis")
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId("grund")
            .setLabel("Grund")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(von),
            new ActionRowBuilder().addComponents(bis),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }

    // ========================================
    // 🚫 SANKTION
    // ========================================

    if (interaction.customId === "sanktion") {

        const modal = new ModalBuilder()
            .setCustomId("sanktion_modal")
            .setTitle("🚫 Sanktion");

        const user = new TextInputBuilder()
            .setCustomId("user")
            .setLabel("Discord Name")
            .setStyle(TextInputStyle.Short);

        const paragraph = new TextInputBuilder()
            .setCustomId("paragraph")
            .setLabel("§ Nummer")
            .setStyle(TextInputStyle.Short);

        const geld = new TextInputBuilder()
            .setCustomId("geld")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId("grund")
            .setLabel("Zusatz / Erweiterung")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(paragraph),
            new ActionRowBuilder().addComponents(geld),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }

    // ========================================
    // 💷 WOCHENABGABE
    // ========================================

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

    // ========================================
    // 🤝 SPENDE
    // ========================================

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

    // ========================================
    // ✏️ FINANZ
    // ========================================

    if (interaction.customId === "finanz") {

        const modal = new ModalBuilder()
            .setCustomId("finanz_modal")
            .setTitle("✏️ Finanz Änderung");

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

// ========================================
// 📝 MODALS
// ========================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    // ========================================
    // 🚑 ABMELDUNG
    // ========================================

    if (interaction.customId === "abmeldung_modal") {

        const von = interaction.fields.getTextInputValue("von");
        const bis = interaction.fields.getTextInputValue("bis");
        const grund = interaction.fields.getTextInputValue("grund");

        const channel = interaction.guild.channels.cache.find(
            ch => ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝘂𝗻𝗴-𝐋𝐢𝐬𝐭𝐞"
        );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("abmeldung_gelesen")
                .setLabel("✅ Gelesen")
                .setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
            .setTitle("📅 Neue Abmeldung")
            .setDescription(`
👤 User:
<@${interaction.user.id}>

📆 Von:
${von}

📆 Bis:
${bis}

📌 Grund:
${grund}
            `)
            .setColor(0x0099ff)
            .setTimestamp();

        channel.send({
            embeds: [embed],
            components: [row]
        });

        interaction.reply({
            content: "✅ Abmeldung gesendet",
            ephemeral: true
        });
    }

    // ========================================
    // 🚫 SANKTION
    // ========================================

    if (interaction.customId === "sanktion_modal") {

        const userInput = interaction.fields.getTextInputValue("user");

        const paragraph = interaction.fields.getTextInputValue("paragraph");

        const geld = Number(
            interaction.fields.getTextInputValue("geld")
        );

        const grund = interaction.fields.getTextInputValue("grund");

        const target = interaction.guild.members.cache.find(m =>
            m.user.username.toLowerCase() === userInput.toLowerCase() ||
            m.displayName.toLowerCase() === userInput.toLowerCase()
        );

        if (!target) {

            return interaction.reply({
                content: "❌ User nicht gefunden",
                ephemeral: true
            });
        }

        familienKasse += geld;

        const channel = interaction.guild.channels.cache.find(
            ch => ch.name === "🚫┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻"
        );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("sanktion_bezahlt")
                .setLabel("✅ Bezahlt")
                .setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
            .setTitle("🚫 Neue Sanktion")
            .setDescription(`
👤 User:
<@${target.user.id}>

📜 Verstoß:
${paragraphen[paragraph] || paragraph}

💸 Betrag:
${geld.toLocaleString()}$

📌 Zusatz:
${grund}

👮 Bearbeiter:
<@${interaction.user.id}>
            `)
            .setColor(0xff0000)
            .setTimestamp();

        channel.send({
            embeds: [embed],
            components: [row]
        });

        // DM

        const dm = await target.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🚫 Du hast eine Sanktion erhalten")
                    .setDescription(`
📜 Verstoß:
${paragraphen[paragraph] || paragraph}

💸 Betrag:
${geld.toLocaleString()}$

📌 Zusatz:
${grund}

⚠️ Bitte bezahle deine Sanktion.
                    `)
                    .setColor(0xff0000)
            ]
        }).catch(() => null);

        if (dm) {

            setTimeout(() => {
                dm.delete().catch(() => {});
            }, deleteTime);
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

    // ========================================
    // 💷 WOCHENABGABE
    // ========================================

    if (interaction.customId === "wochen_modal") {

        const user = interaction.fields.getTextInputValue("user");

        const geld = Number(
            interaction.fields.getTextInputValue("geld")
        );

        familienKasse += geld;

        const channel = interaction.guild.channels.cache.find(
            ch => ch.name === "💷┃𝐖𝐨𝐜𝐡𝐞𝐧𝐚𝐛𝐠𝐚𝐛𝐞𝐧"
        );

        const embed = new EmbedBuilder()
            .setTitle("💷 Wochenabgabe")
            .setDescription(`
👤 User:
${user}

💸 Betrag:
${geld.toLocaleString()}$
            `)
            .setColor(0x00ff00)
            .setTimestamp();

        if (channel) {
            channel.send({
                embeds: [embed]
            });
        }

        await updateFinanzOverview(
            interaction.guild,
            `Wochenabgabe +${geld.toLocaleString()}$`,
            interaction.user.tag
        );

        interaction.reply({
            content: "✅ Wochenabgabe eingetragen",
            ephemeral: true
        });
    }

    // ========================================
    // 🤝 SPENDE
    // ========================================

    if (interaction.customId === "spende_modal") {

        const user = interaction.fields.getTextInputValue("user");

        const geld = Number(
            interaction.fields.getTextInputValue("geld")
        );

        familienKasse += geld;

        await updateFinanzOverview(
            interaction.guild,
            `Spende +${geld.toLocaleString()}$`,
            interaction.user.tag
        );

        interaction.reply({
            content: "✅ Spende eingetragen",
            ephemeral: true
        });
    }

    // ========================================
    // ✏️ FINANZ
    // ========================================

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

// ========================================
// 🔑 LOGIN
// ========================================

client.login(process.env.TOKEN);