export async function MessageActions() {
  return {
    props: ["onEdit", "onDelete"],
    data() {
      return {
        showMenu: false,
      };
    },
    methods: {
      toggleMenu() {
        this.showMenu = !this.showMenu;
      },
    },
    template: await fetch("./message-actions.html").then((r) => r.text()),
  };
}
