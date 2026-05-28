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
// 💰 FINANZEN SPEICHER
// =========================
let finance = {
    total: 0,
    sanktionen: 0,
    wochenabgaben: 0
};

function updateFinance(amount, type) {
    finance.total += amount;

    if (type === "sanktion") finance.sanktionen += amount;
    if (type === "week") finance.wochenabgaben += amount;
}

function financeEmbed() {
    return new EmbedBuilder()
        .setTitle("🏦 Finanz Übersicht")
        .setColor(0x00ffcc)
        .addFields(
            { name: "💰 Gesamtkasse", value: `${finance.total.toLocaleString()}$`, inline: false },
            { name: "🚫 Sanktionen", value: `${finance.sanktionen.toLocaleString()}$`, inline: true },
            { name: "💷 Wochenabgaben", value: `${finance.wochenabgaben.toLocaleString()}$`, inline: true }
        )
        .setTimestamp();
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

        // 💰 FINANZEN
        const fin = message.guild.channels.cache.find(ch =>
            ch.name === "💰┃finanz-übersicht"
        );

        if (fin) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("fin_add").setLabel("➕").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("fin_remove").setLabel("➖").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("fin_set").setLabel("✏️").setStyle(ButtonStyle.Secondary)
            );

            fin.send({
                embeds: [financeEmbed()],
                components: [row]
            });
        }

        message.reply("✅ Panel erstellt");
    }
});

// =========================
// 🔘 BUTTONS
// =========================
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    // =========================
    // FINANZ EDITOR
    // =========================
    if (interaction.customId === "fin_add") {

        const modal = new ModalBuilder()
            .setCustomId("fin_add_modal")
            .setTitle("Geld hinzufügen");

        const amount = new TextInputBuilder()
            .setCustomId("amount")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(amount));

        return interaction.showModal(modal);
    }

    if (interaction.customId === "fin_remove") {

        const modal = new ModalBuilder()
            .setCustomId("fin_remove_modal")
            .setTitle("Geld abziehen");

        const amount = new TextInputBuilder()
            .setCustomId("amount")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(amount));

        return interaction.showModal(modal);
    }

    if (interaction.customId === "fin_set") {

        const modal = new ModalBuilder()
            .setCustomId("fin_set_modal")
            .setTitle("Gesamt setzen");

        const amount = new TextInputBuilder()
            .setCustomId("amount")
            .setLabel("Neuer Wert")
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(amount));

        return interaction.showModal(modal);
    }

    // =========================
    // 🚫 SANKTION MENU (NEU)
    // =========================
    if (interaction.customId === "sanktion_menu") {

        const menu = new StringSelectMenuBuilder()
            .setCustomId("sanktion_select")
            .setPlaceholder("§ auswählen")
            .addOptions(
                { label: "§1", value: "1-75000" },
                { label: "§2", value: "2-200000" },
                { label: "§3", value: "3-100000" },
                { label: "§6", value: "6-500000" },
                { label: "§9", value: "9-50000" },
                { label: "§11", value: "11-50000" },
                { label: "§14", value: "14-250000" },
                { label: "§18", value: "18-200000" }
            );

        const row = new ActionRowBuilder().addComponents(menu);

        return interaction.reply({
            content: "🚫 Wähle § Regel",
            components: [row],
            ephemeral: true
        });
    }
});

// =========================
// 📝 MODALS FINANZEN
// =========================
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    const amount = Number(interaction.fields.getTextInputValue("amount") || 0);

    if (interaction.customId === "fin_add_modal") {
        updateFinance(amount, "add");
    }

    if (interaction.customId === "fin_remove_modal") {
        updateFinance(-amount, "remove");
    }

    if (interaction.customId === "fin_set_modal") {
        finance.total = amount;
    }

    const channel = interaction.guild.channels.cache.find(ch =>
        ch.name === "💰┃finanz-übersicht"
    );

    if (channel) {
        channel.send({ embeds: [financeEmbed()] });
    }

    interaction.reply({ content: "✅ Aktualisiert", ephemeral: true });
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);