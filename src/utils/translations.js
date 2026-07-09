export const loadTranslation = async (lang) => {
  const langKey = lang.toLowerCase();
  try {
    const module = await import(`./locales/${langKey}.json`);
    return module.default || module;
  } catch (error) {
    console.error(`Error loading language file for ${lang}:`, error);
    return {};
  }
};
