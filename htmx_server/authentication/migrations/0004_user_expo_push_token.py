from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0003_user_roles_and_sections'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='expo_push_token',
            field=models.CharField(
                blank=True, default='', max_length=200,
                help_text='Expo push token for mobile push notifications',
            ),
        ),
    ]
