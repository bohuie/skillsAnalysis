# Generated by Django 4.0.1 on 2022-03-25 10:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_skill_verified_alter_skill_job_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobposting',
            name='url',
            field=models.CharField(default='https://google.com', max_length=100),
            preserve_default=False,
        ),
    ]
