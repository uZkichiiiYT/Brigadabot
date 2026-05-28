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
// 🟢 BOT START
// =========================
client.once(Events.ClientReady, () => {
    console.log(`✅ Eingeloggt als ${client.user.tag}`);
});

// =========================
// 👋 WILLKOMMEN SYSTEM
// =========================
client.on(Events.GuildMemberAdd, member => {

    const channel = member.guild.channels.cache.find(
        ch => ch.name === '👋┃willkommen'
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle('👋 Willkommen bei Brigada')
        .setDescription(`Willkommen ${member}`)
        .setColor(0x000000)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

    channel.send({ embeds: [embed] });
});

// =========================
// 📌 PANEL COMMAND (FIXED)
// =========================
client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === '!panel') {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Keine Rechte!');
        }

        const abmeldenChannel = message.guild.channels.cache.find(
            ch => ch.name === '🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻'
        );

        const sanktionPanel = message.guild.channels.cache.find(
            ch => ch.name === '📓┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻-verwaltung'
        );

        if (!abmeldenChannel && !sanktionPanel) {
            return message.reply("❌ Channels nicht gefunden!");
        }

        // =========================
        // 🚑 ABMELDEN PANEL
        // =========================
        if (abmeldenChannel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('abmelden')
                    .setLabel('📅 Abmelden')
                    .setStyle(ButtonStyle.Primary)
            );

            const embed = new EmbedBuilder()
                .setTitle('🚑 Abmeldesystem')
                .setDescription('Nutze den Button für Abmeldung')
                .setColor(0x0099ff)
                .setTimestamp();

            abmeldenChannel.send({
                embeds: [embed],
                components: [row]
            });
        }

        // =========================
        // 🚫 SANKTION PANEL
        // =========================
        if (sanktionPanel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('sanktion')
                    .setLabel('🚫 Sanktion erstellen')
                    .setStyle(ButtonStyle.Danger)
            );

            const embed = new EmbedBuilder()
                .setTitle('🚫 Sanktionssystem')
                .setDescription('Nutze den Button für Sanktionen')
                .setColor(0xff0000)
                .setTimestamp();

            sanktionPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        message.reply('✅ Panels erstellt!');
    }
});

// =========================
// 🔘 BUTTON SYSTEM (UNVERÄNDERT)
// =========================
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    if (interaction.customId === 'abmelden') {

        const modal = new ModalBuilder()
            .setCustomId('abmeldung_modal')
            .setTitle('📅 Abmeldung');

        const von = new TextInputBuilder()
            .setCustomId('von')
            .setLabel('Datum von')
            .setStyle(TextInputStyle.Short);

        const bis = new TextInputBuilder()
            .setCustomId('bis')
            .setLabel('Datum bis')
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId('grund')
            .setLabel('Grund')
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(von),
            new ActionRowBuilder().addComponents(bis),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }

    if (interaction.customId === 'sanktion') {

        const modal = new ModalBuilder()
            .setCustomId('sanktion_modal')
            .setTitle('🚫 Sanktion');

        const name = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Name')
            .setStyle(TextInputStyle.Short);

        const betrag = new TextInputBuilder()
            .setCustomId('betrag')
            .setLabel('Wieviel?')
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId('grund')
            .setLabel('Grund')
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(name),
            new ActionRowBuilder().addComponents(betrag),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }
});

// =========================
// 📝 MODALS (UNVERÄNDERT)
// =========================
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'abmeldung_modal') {

        const von = interaction.fields.getTextInputValue('von');
        const bis = interaction.fields.getTextInputValue('bis');
        const grund = interaction.fields.getTextInputValue('grund');

        const channel = interaction.guild.channels.cache.find(
            ch => ch.name === '🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻-𝐋𝐢𝐬𝐭𝐞'
        );

        if (!channel) return interaction.reply({ content: '❌ Channel fehlt!', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('📅 Neue Abmeldung')
            .addFields(
                { name: '👤 Name', value: `${interaction.user}` },
                { name: '📆 Von', value: von, inline: true },
                { name: '📆 Bis', value: bis, inline: true },
                { name: '📌 Grund', value: grund }
            )
            .setColor(0x0099ff)
            .setTimestamp();

        channel.send({ embeds: [embed] });

        interaction.reply({ content: '✅ Abmeldung gesendet!', ephemeral: true });
    }

    if (interaction.customId === 'sanktion_modal') {

        const name = interaction.fields.getTextInputValue('name');
        const betrag = interaction.fields.getTextInputValue('betrag');
        const grund = interaction.fields.getTextInputValue('grund');

        const channel = interaction.guild.channels.cache.find(
            ch => ch.name === '🚫┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻'
        );

        if (!channel) return interaction.reply({ content: '❌ Channel fehlt!', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('🚫 Neue Sanktion')
            .addFields(
                { name: '👤 Name', value: name },
                { name: '💰 Betrag', value: betrag },
                { name: '📌 Grund', value: grund }
            )
            .setColor(0xff0000)
            .setTimestamp();

        channel.send({ embeds: [embed] });

        interaction.reply({ content: '✅ Sanktion erstellt!', ephemeral: true });
    }
});

// =========================
// 🔑 LOGIN
// =========================
client.login(process.env.TOKEN);