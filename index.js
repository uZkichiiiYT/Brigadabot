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
// 💰 FINANZEN (IN MEMORY)
// =========================
let finance = {
    total: 0,
    sanktionen: 0,
    wochenabgaben: 0
};

function financeEmbed() {
    return new EmbedBuilder()
        .setTitle("🏦 Finanz Übersicht")
        .setColor(0x00ffcc)
        .addFields(
            { name: "💰 Gesamtkasse", value: `${finance.total.toLocaleString()}$` },
            { name: "🚫 Sanktionen", value: `${finance.sanktionen.toLocaleString()}$`, inline: true },
            { name: "💷 Wochenabgaben", value: `${finance.wochenabgaben.toLocaleString()}$`, inline: true }
        )
        .setTimestamp();
}

// =========================
// 🟢 BOT START
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

        // 💰 FINANZEN
        const fin = message.guild.channels.cache.find(ch =>
            ch.name === "💰┃finanz-übersicht"
        );

        if (fin) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("fin_refresh").setLabel("🔄 Update").setStyle(ButtonStyle.Primary)
            );

            fin.send({ embeds: [financeEmbed()], components: [row] });
        }

        // 🚑 ABMELDUNG
        const ab = message.guild.channels.cache.find(ch =>
            ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻"
        );

        if (ab) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("abmeldung").setLabel("📅 Abmelden").setStyle(ButtonStyle.Primary)
            );

            ab.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🚑 Abmeldesystem")
                        .setColor(0x0099ff)
                ],
                components: [row]
            });
        }

        // 💷 WOCHENABGABE
        const week = message.guild.channels.cache.find(ch =>
            ch.name === "💷┃wochenabgabe"
        );

        if (week) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("week").setLabel("💷 Abgeben").setStyle(ButtonStyle.Success)
            );

            week.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("💷 Wochenabgabe")
                        .setColor(0xffff00)
                ],
                components: [row]
            });
        }

        // 🚫 SANKTION
        const sanc = message.guild.channels.cache.find(ch =>
            ch.name === "📓┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻-verwaltung"
        );

        if (sanc) {

            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("sanktion_select")
                    .setPlaceholder("§ auswählen")
                    .addOptions(
                        { label: "§1", value: "75000" },
                        { label: "§2", value: "350000" },
                        { label: "§3", value: "100000" },
                        { label: "§6", value: "500000" },
                        { label: "§9", value: "50000" },
                        { label: "§14", value: "250000" },
                        { label: "§18", value: "200000" }
                    )
            );

            sanc.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🚫 Sanktion System")
                        .setColor(0xff0000)
                ],
                components: [menu]
            });
        }

        message.reply("✅ Panel erstellt");
    }
});

// =========================
// 🔘 INTERACTIONS
// =========================
client.on(Events.InteractionCreate, async interaction => {

    // =========================
    // BUTTONS
    // =========================
    if (interaction.isButton()) {

        // 🚑 ABMELDUNG
        if (interaction.customId === "abmeldung") {

            const modal = new ModalBuilder()
                .setCustomId("abmeldung_modal")
                .setTitle("Abmeldung");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("von").setLabel("Von").setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("bis").setLabel("Bis").setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("grund").setLabel("Grund").setStyle(TextInputStyle.Paragraph)
                )
            );

            return interaction.showModal(modal);
        }

        // 💷 WOCHENABGABE
        if (interaction.customId === "week") {

            const modal = new ModalBuilder()
                .setCustomId("week_modal")
                .setTitle("Wochenabgabe");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("amount").setLabel("Betrag").setStyle(TextInputStyle.Short)
                )
            );

            return interaction.showModal(modal);
        }

        // 🔄 FINANZEN UPDATE
        if (interaction.customId === "fin_refresh") {
            return interaction.reply({
                embeds: [financeEmbed()],
                ephemeral: true
            });
        }
    }

    // =========================
    // SANKTION MENU
    // =========================
    if (interaction.isStringSelectMenu() && interaction.customId === "sanktion_select") {

        const amount = Number(interaction.values[0]);

        finance.total += amount;
        finance.sanktionen += amount;

        const channel = interaction.guild.channels.cache.find(ch =>
            ch.name === "🚫┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻"
        );

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🚫 Sanktion")
                    .setDescription(`💰 ${amount}$`)
                    .setColor(0xff0000)
            ]
        });

        return interaction.reply({ content: "✅ Sanktion gespeichert", ephemeral: true });
    }

    // =========================
    // MODALS
    // =========================
    if (!interaction.isModalSubmit()) return;

    // 🚑 ABMELDUNG
    if (interaction.customId === "abmeldung_modal") {

        const von = interaction.fields.getTextInputValue("von");
        const bis = interaction.fields.getTextInputValue("bis");
        const grund = interaction.fields.getTextInputValue("grund");

        const channel = interaction.guild.channels.cache.find(ch =>
            ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝘂𝗻𝗴-𝐋𝐢𝐬𝐭𝐞"
        );

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("📅 Abmeldung")
                    .addFields(
                        { name: "User", value: `${interaction.user}` },
                        { name: "Von", value: von },
                        { name: "Bis", value: bis },
                        { name: "Grund", value: grund }
                    )
                    .setColor(0x0099ff)
            ]
        });

        return interaction.reply({ content: "✅ Abmeldung gesendet", ephemeral: true });
    }

    // 💷 WOCHENABGABE
    if (interaction.customId === "week_modal") {

        const amount = Number(interaction.fields.getTextInputValue("amount"));

        finance.total += amount;
        finance.wochenabgaben += amount;

        const channel = interaction.guild.channels.cache.find(ch =>
            ch.name === "💷┃wochenabgabe-verwaltung"
        );

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("💷 Wochenabgabe")
                    .setDescription(`${amount}$`)
                    .setColor(0xffff00)
            ]
        });

        return interaction.reply({ content: "✅ gespeichert", ephemeral: true });
    }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);