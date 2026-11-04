import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { initialMentorProfiles } from '../src/modules/mentors/mentor-profiles';

const prisma = new PrismaClient();
const PROMPTS_DIR = path.join(process.cwd(), 'src', 'modules', 'mentors', 'prompts');

async function main() {
  console.log('Seeding mentor prompts...');

  for (const profile of initialMentorProfiles) {
    const promptPath = path.join(PROMPTS_DIR, `${profile.promptKey}.md`);
    const content = await readFile(promptPath, 'utf-8');

    await prisma.mentorPrompt.upsert({
      where: { key: profile.promptKey },
      update: { content },
      create: { key: profile.promptKey, content },
    });
    console.log(`  ✓ prompt ${profile.promptKey}`);
  }

  console.log('Seeding mentor profiles...');

  for (const profile of initialMentorProfiles) {
    await prisma.mentorProfile.upsert({
      where: { slug: profile.slug },
      update: {
        name: profile.name,
        technology: profile.technology,
        teachingStyle: profile.teachingStyle,
        promptKey: profile.promptKey,
      },
      create: {
        slug: profile.slug,
        name: profile.name,
        technology: profile.technology,
        teachingStyle: profile.teachingStyle,
        promptKey: profile.promptKey,
      },
    });
    console.log(`  ✓ profile ${profile.slug}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
