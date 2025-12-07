export const createPageUrl = (pageName) => `/${pageName}`;

export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  element?.scrollIntoView({ behavior: 'smooth' });
};
