# Generated by Django 4.0.1 on 2022-03-09 01:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0004_profile_resume_processing_alter_profile_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='skills',
            field=models.TextField(default='[]'),
        ),
    ]