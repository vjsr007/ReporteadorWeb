using System;

namespace ReporteadorWeb.Models
{
    public class EntityER
    {
        public Guid id { get; set; }
        public string name { get; set; }
        public string type { get; set; }
        public PropertyER[] entities { get; set; }
        public UserData[] userData { get; set; }
        public string json { get; set; }
        public Guid? targetNode { get; set; }
        public string targetPort { get; set; }
        public Guid? sourceNode { get; set; }
        public string sourcePort { get; set; }
    }
}