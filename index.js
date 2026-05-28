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

// ========================================
// 💰 FINANZEN
// ========================================

let familienKasse = 10000000;
let sanktionenGesamt = 0;
let wochenabgabenGesamt = 0;
let freiwilligGesamt = 0;

let finanzMessage = null;

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
// 📜 § LISTE
// ========================================

const paragraphen = `
§1 Beleidigung
§2 Respektlosigkeit
§3 Schießen im HQ
§4 FailRP
§5 Copbaiting
§6 RDM
§7 VDM
§8 HQ Angriff
§9 PowerRP
§10 Teaming
§11 Bugusing
§12 Combatlog
§13 Trolling
§14 Betrug
§15 Korruption
§16 Waffenhandel
§17 Missachtung
§18 Illegale Aktionen
§19 Schwerer Regelbruch
`;

// ========================================
// 🟢 BOT ONLINE
// ========================================

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot online als ${client.user.tag}`);
});

// ========================================
// 💰 FINANZ UPDATE
// ========================================

async function updateFinanzen(guild) {

    const channel = guild.channels.cache.find(
        ch => ch.name === "💰┃finanz-übersicht"
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("💰 Brigada Finanzübersicht")
        .addFields(
            {
                name: "🏦 Familien Kasse",
                value: `${familienKasse.toLocaleString()}$`
            },
            {
                name: "🚫 Sanktionen",
                value: `${sanktionenGesamt.toLocaleString()}$`,
                inline: true
            },
            {
                name: "💷 Wochenabgaben",
                value: `${wochenabgabenGesamt.toLocaleString()}$`,
                inline: true
            },
            {
                name: "🤝 Freiwillige Spenden",
                value: `${freiwilligGesamt.toLocaleString()}$`,
                inline: true
            }
        )
        .setColor(0x00ff99)
        .setTimestamp();

    if (!finanzMessage) {

        finanzMessage = await channel.send({
            embeds: [embed]
        });

    } else {

        await finanzMessage.edit({
            embeds: [embed]
        }).catch(async () => {

            finanzMessage = await channel.send({
                embeds: [embed]
            });
        });
    }
}

// ========================================
// 📌 PANEL COMMAND
// ========================================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Keine Rechte");
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
                .setDescription("Klicke unten auf den Button.")
                .setColor(0x0099ff);

            abmeldungPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        // ========================================
        // 🚫 SANKTION PANEL
        // ========================================

        const sanktionPanel = message.guild.channels.cache.find(
            ch => ch.name === "📓┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻-verwaltung"
        );

        if (sanktionPanel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("sanktion")
                    .setLabel("🚫 Sanktion erstellen")
                    .setStyle(ButtonStyle.Danger)
            );

            const embed = new EmbedBuilder()
                .setTitle("🚫 Sanktions Verwaltung")
                .setDescription("Sanktionen erstellen")
                .setColor(0xff0000);

            sanktionPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        // ========================================
        // 💷 FINANZEN PANEL
        // ========================================

        const finanzPanel = message.guild.channels.cache.find(
            ch => ch.name === "💷┃𝐖𝐨𝐜𝐡𝐞𝐧𝐚𝐛𝐠𝐚𝐛𝐞-verwaltung"
        );

        if (finanzPanel) {

            const row = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setCustomId("wochenabgabe")
                    .setLabel("💷 Wochenabgabe")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("freiwillig")
                    .setLabel("🤝 Freiwillige Spende")
                    .setStyle(ButtonStyle.Success)
            );

            const embed = new EmbedBuilder()
                .setTitle("💰 Finanz Verwaltung")
                .setDescription("Wochenabgaben & Spenden")
                .setColor(0xffff00);

            finanzPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        updateFinanzen(message.guild);

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

        const geld = new TextInputBuilder()
            .setCustomId("geld")
            .setLabel("Strafe")
            .setStyle(TextInputStyle.Short);

        const paragraph = new TextInputBuilder()
            .setCustomId("paragraph")
            .setLabel("§ Nummern")
            .setPlaceholder("z.B §3, §7, §19")
            .setStyle(TextInputStyle.Short);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(geld),
            new ActionRowBuilder().addComponents(paragraph)
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

        modal.addComponents(
            new ActionRowBuilder().addComponents(user)
        );

        await interaction.showModal(modal);
    }

    // ========================================
    // 🤝 SPENDE
    // ========================================

    if (interaction.customId === "freiwillig") {

        const modal = new ModalBuilder()
            .setCustomId("spende_modal")
            .setTitle("🤝 Freiwillige Spende");

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
    // ✅ SANKTION BEZAHLT
    // ========================================

    if (interaction.customId === "sanktion_bezahlt") {

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        const amountField = embed.data.fields.find(f => f.name === "💰 Strafe");

        const geld = parseInt(
            amountField.value.replace(/\D/g, "")
        );

        sanktionenGesamt += geld;
        familienKasse += geld;

        embed.setColor(0x00ff00);

        embed.setFooter({
            text: `✅ Bezahlt von ${interaction.user.tag}`
        });

        await interaction.message.edit({
            embeds: [embed],
            components: []
        });

        updateFinanzen(interaction.guild);

        interaction.reply({
            content: "✅ Sanktion bezahlt",
            ephemeral: true
        });
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
            .addFields(
                {
                    name: "👤 User",
                    value: `<@${interaction.user.id}>`
                },
                {
                    name: "📆 Von",
                    value: von,
                    inline: true
                },
                {
                    name: "📆 Bis",
                    value: bis,
                    inline: true
                },
                {
                    name: "📌 Grund",
                    value: grund
                }
            )
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
    // 🚫 SANKTION MODAL
    // ========================================

    if (interaction.customId === "sanktion_modal") {

        const userInput = interaction.fields.getTextInputValue("user");
        const geld = interaction.fields.getTextInputValue("geld");
        const paragraph = interaction.fields.getTextInputValue("paragraph");

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
            .setDescription(paragraphen)
            .addFields(
                {
                    name: "👤 User",
                    value: `<@${target.user.id}>`
                },
                {
                    name: "💰 Strafe",
                    value: `${geld}$`
                },
                {
                    name: "📜 Paragraphen",
                    value: paragraph
                },
                {
                    name: "👮 Von",
                    value: `<@${interaction.user.id}>`
                }
            )
            .setColor(0xff0000)
            .setTimestamp();

        channel.send({
            content: `<@${target.user.id}>`,
            embeds: [embed],
            components: [row]
        });

        const dmMessage = await target.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🚫 Du hast eine Sanktion erhalten")
                    .setDescription(`
💰 Strafe:
${geld}$

📜 Paragraphen:
${paragraph}

⚠️ Bitte bezahlen.
                    `)
                    .setColor(0xff0000)
            ]
        }).catch(() => null);

        if (dmMessage) {

            setTimeout(() => {
                dmMessage.delete().catch(() => {});
            }, deleteTime);
        }

        interaction.reply({
            content: "✅ Sanktion erstellt",
            ephemeral: true
        });
    }

    // ========================================
    // 💷 WOCHENABGABE
    // ========================================

    if (interaction.customId === "wochen_modal") {

        const userInput = interaction.fields.getTextInputValue("user");

        const target = interaction.guild.members.cache.find(m =>
            m.user.username.toLowerCase() === userInput.toLowerCase()
        );

        if (!target) {
            return interaction.reply({
                content: "❌ User nicht gefunden",
                ephemeral: true
            });
        }

        wochenabgabenGesamt += 350000;
        familienKasse += 350000;

        updateFinanzen(interaction.guild);

        interaction.reply({
            content: "✅ Wochenabgabe eingetragen",
            ephemeral: true
        });
    }

    // ========================================
    // 🤝 SPENDE
    // ========================================

    if (interaction.customId === "spende_modal") {

        const geld = parseInt(
            interaction.fields.getTextInputValue("geld")
        );

        freiwilligGesamt += geld;
        familienKasse += geld;

        updateFinanzen(interaction.guild);

        interaction.reply({
            content: "✅ Spende eingetragen",
            ephemeral: true
        });
    }
});

// ========================================
// 🔑 LOGIN
// ========================================

client.login(process.env.TOKEN);